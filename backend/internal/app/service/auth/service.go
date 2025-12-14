package auth

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/repository"
	"pfn-backend/internal/pkg/jwt"
	"pfn-backend/internal/pkg/logger"
	"pfn-backend/internal/pkg/password"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error)
	Login(ctx context.Context, req LoginRequest) (*AuthResponse, error)
	RefreshToken(ctx context.Context, req RefreshTokenRequest) (*TokenResponse, error)
	Logout(ctx context.Context, userID uuid.UUID) error
	ForgotPassword(ctx context.Context, req ForgotPasswordRequest) (*MessageResponse, error)
	ResetPassword(ctx context.Context, req ResetPasswordRequest) (*MessageResponse, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, req ChangePasswordRequest) error
}

type service struct {
	userRepo         repository.UserRepository
	refreshTokenRepo repository.RefreshTokenRepository
	jwtManager       *jwt.JWTManager
	logger           *logger.Logger
}

func NewService(
	userRepo repository.UserRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	jwtManager *jwt.JWTManager,
	logger *logger.Logger,
) Service {
	return &service{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		jwtManager:       jwtManager,
		logger:           logger,
	}
}

func (s *service) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	// Validate password strength
	strength := password.ValidateStrength(req.Password)
	if !strength.IsValid {
		return nil, fmt.Errorf("password is too weak: %s", strength.Feedback[0])
	}

	// Check if user already exists
	exists, err := s.userRepo.Exists(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check user existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := password.Hash(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &entity.User{
		ID:           uuid.New(),
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Generate tokens
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	// Store refresh token
	refreshTokenHash := password.HashToken(tokenPair.RefreshToken)
	refreshToken := &entity.RefreshToken{
		UserID:    user.ID,
		TokenHash: refreshTokenHash,
		ExpiresAt: time.Now().Add(s.jwtManager.GetRefreshExpiry()),
		Revoked:   false,
	}

	if err := s.refreshTokenRepo.Create(ctx, refreshToken); err != nil {
		s.logger.Error("Failed to store refresh token", logger.Error(err))
	}

	return &AuthResponse{
		User: UserData{
			ID:        user.ID,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			FullName:  user.FullName(),
			IsActive:  user.IsActive,
		},
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresIn:    tokenPair.ExpiresIn,
	}, nil
}

func (s *service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Check if user is active
	if !user.IsActive {
		return nil, fmt.Errorf("account is deactivated")
	}

	// Verify password
	if err := password.Verify(req.Password, user.PasswordHash); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Generate tokens
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	// Store refresh token
	refreshTokenHash := password.HashToken(tokenPair.RefreshToken)
	refreshToken := &entity.RefreshToken{
		UserID:    user.ID,
		TokenHash: refreshTokenHash,
		ExpiresAt: time.Now().Add(s.jwtManager.GetRefreshExpiry()),
		Revoked:   false,
	}

	if err := s.refreshTokenRepo.Create(ctx, refreshToken); err != nil {
		s.logger.Error("Failed to store refresh token", logger.Error(err))
	}

	return &AuthResponse{
		User: UserData{
			ID:        user.ID,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			FullName:  user.FullName(),
			IsActive:  user.IsActive,
		},
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresIn:    tokenPair.ExpiresIn,
	}, nil
}

func (s *service) RefreshToken(ctx context.Context, req RefreshTokenRequest) (*TokenResponse, error) {
	// Validate refresh token
	claims, err := s.jwtManager.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Check if token exists and is not revoked
	refreshTokenHash := password.HashToken(req.RefreshToken)
	storedToken, err := s.refreshTokenRepo.FindByToken(ctx, refreshTokenHash)
	if err != nil {
		return nil, fmt.Errorf("refresh token not found or expired")
	}

	// Get user
	user, err := s.userRepo.FindByID(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	if !user.IsActive {
		return nil, fmt.Errorf("account is deactivated")
	}

	// Revoke old refresh token
	if err := s.refreshTokenRepo.RevokeToken(ctx, refreshTokenHash); err != nil {
		s.logger.Error("Failed to revoke old refresh token", logger.Error(err))
	}

	// Generate new tokens
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	// Store new refresh token
	newRefreshTokenHash := password.HashToken(tokenPair.RefreshToken)
	newRefreshToken := &entity.RefreshToken{
		UserID:    user.ID,
		TokenHash: newRefreshTokenHash,
		ExpiresAt: time.Now().Add(s.jwtManager.GetRefreshExpiry()),
		Revoked:   false,
	}

	if err := s.refreshTokenRepo.Create(ctx, newRefreshToken); err != nil {
		s.logger.Error("Failed to store new refresh token", logger.Error(err))
	}

	// Clean up old token
	_ = storedToken

	return &TokenResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresIn:    tokenPair.ExpiresIn,
	}, nil
}

func (s *service) Logout(ctx context.Context, userID uuid.UUID) error {
	// Revoke all user's refresh tokens
	if err := s.refreshTokenRepo.RevokeByUserID(ctx, userID); err != nil {
		return fmt.Errorf("failed to revoke tokens: %w", err)
	}

	return nil
}

func (s *service) ForgotPassword(ctx context.Context, req ForgotPasswordRequest) (*MessageResponse, error) {
	// Check if user exists
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		// Don't reveal if email exists or not for security
		return &MessageResponse{
			Message: "If an account with this email exists, a password reset link has been sent",
		}, nil
	}

	// Generate reset token
	resetToken, err := s.jwtManager.GenerateResetToken(user.ID, user.Email)
	if err != nil {
		s.logger.Error("Failed to generate reset token", logger.Error(err))
		return nil, fmt.Errorf("failed to generate reset token")
	}

	// TODO: Send email with reset token
	// For now, we'll log it (in production, this should be sent via email)
	s.logger.Info("Password reset token generated", logger.String("email", user.Email), logger.String("token", resetToken))

	return &MessageResponse{
		Message: "If an account with this email exists, a password reset link has been sent",
	}, nil
}

func (s *service) ResetPassword(ctx context.Context, req ResetPasswordRequest) (*MessageResponse, error) {
	// Validate reset token
	claims, err := s.jwtManager.ValidateResetToken(req.Token)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired reset token")
	}

	// Validate new password strength
	strength := password.ValidateStrength(req.NewPassword)
	if !strength.IsValid {
		return nil, fmt.Errorf("password is too weak: %s", strength.Feedback[0])
	}

	// Get user
	user, err := s.userRepo.FindByID(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Hash new password
	hashedPassword, err := password.Hash(req.NewPassword)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	user.PasswordHash = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update password: %w", err)
	}

	// Revoke all refresh tokens for security
	if err := s.refreshTokenRepo.RevokeByUserID(ctx, user.ID); err != nil {
		s.logger.Error("Failed to revoke tokens after password reset", logger.Error(err))
	}

	return &MessageResponse{
		Message: "Password has been reset successfully",
	}, nil
}

func (s *service) ChangePassword(ctx context.Context, userID uuid.UUID, req ChangePasswordRequest) error {
	// Get user
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	// Verify old password
	if err := password.Verify(req.OldPassword, user.PasswordHash); err != nil {
		return fmt.Errorf("invalid current password")
	}

	// Validate new password strength
	strength := password.ValidateStrength(req.NewPassword)
	if !strength.IsValid {
		return fmt.Errorf("password is too weak: %s", strength.Feedback[0])
	}

	// Hash new password
	hashedPassword, err := password.Hash(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	user.PasswordHash = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Revoke all refresh tokens for security
	if err := s.refreshTokenRepo.RevokeByUserID(ctx, userID); err != nil {
		s.logger.Error("Failed to revoke tokens after password change", logger.Error(err))
	}

	return nil
}
