package config

import (
	"fmt"
	"strings"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JwtConfig      `mapstructure:"jwt"`
	CORS     CORSConfig     `mapstructure:"cors"`
	Logger   LoggerConfig   `mapstructure:"logger"`
	Tracer   TracerConfig   `mapstructure:"tracer"`
}

type AppConfig struct {
	Name        string `mapstructure:"name"`
	Host        string `mapstructure:"host"`
	Port        string `mapstructure:"port"`
	Environment string `mapstructure:"environment"`
}

type DatabaseConfig struct {
	Host            string        `mapstructure:"host"`
	Port            int           `mapstructure:"port"`
	User            string        `mapstructure:"user"`
	Password        string        `mapstructure:"password"`
	Name            string        `mapstructure:"name"`
	SSLMode         string        `mapstructure:"ssl_mode"`
	MaxOpenConns    int           `mapstructure:"max_open_conns"`
	MaxIdleConns    int           `mapstructure:"max_idle_conns"`
	ConnMaxLifetime time.Duration `mapstructure:"conn_max_lifetime"`
	DebugLevel      string        `mapstrucutre:"debug_level"`
}

// DSN returns the database connection string
func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.Name, d.SSLMode,
	)
}

type JwtConfig struct {
	AccessSecret       string        `mapstructure:"access_secret"`
	RefreshSecret      string        `mapstructure:"refresh_secret"`
	AccessTokenExpiry  time.Duration `mapstructure:"access_token_expiry"`
	RefreshTokenExpiry time.Duration `mapstructure:"refresh_token_expiry"`
	ResetTokenExpiry   time.Duration `mapstructure:"reset_token_expiry"`
	VerifyTokenExpiry  time.Duration `mapstructure:"verify_token_expiry"`
	Issuer             string        `mapstructure:"issuer"`
}

type CORSConfig struct {
	AllowOrigins  []string `mapstructure:"allow_origins"`
	AllowMethods  []string `mapstructure:"allow_methods"`
	AllowHeaders  []string `mapstructure:"allow_headers"`
	ExposeHeaders []string `mapstructure:"expose_headers"`
	MaxAge        int      `mapstructure:"max_age"`
}

type LoggerConfig struct {
	Level      string `mapstructure:"level"`  // debug, info, warn, error
	Format     string `mapstructure:"format"` // json, console
	Output     string `mapstructure:"output"` // stdout, file path
	TimeFormat string `mapstructure:"time_format"`
}
type TracerConfig struct {
	Enabled     bool    `mapstructure:"enabled"`
	ServiceName string  `mapstructure:"service_name"`
	Endpoint    string  `mapstructure:"endpoint"`
	Insecure    bool    `mapstructure:"insecure"`
	SampleRate  float64 `mapstructure:"sample_rate"`
}

func Load(configPath string) (*Config, error) {
	v := viper.New()

	// set default values
	setDefaults(v)

	if configPath != "" {
		v.SetConfigFile(configPath)
	} else {
		v.SetConfigName("config")
		v.SetConfigType("yaml")
		v.AddConfigPath(".")
		v.AddConfigPath("./config")
		v.AddConfigPath("/etc/cinemaos/")
	}

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}
	}

	v.SetEnvPrefix("PFM")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// unmarshal into config
	var config Config
	if err := v.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}
	return &config, nil
}

func setDefaults(v *viper.Viper) {
	// App defaults
	v.SetDefault("app.name", "CinemaOS")
	v.SetDefault("server.host", "0.0.0.0")
	v.SetDefault("server.port", 8080)

	// Database defaults
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "postgres")
	v.SetDefault("database.password", "postgres")
	v.SetDefault("database.name", "pfm-database")
	v.SetDefault("database.ssl_mode", "disable")
	v.SetDefault("database.max_open_conns", 25)
	v.SetDefault("database.max_idle_conns", 10)
	v.SetDefault("database.conn_max_lifetime", "5m")

	// JWT defaults
	v.SetDefault("jwt.access_secret", "your-super-secret-access-key-change-in-production")
	v.SetDefault("jwt.refresh_secret", "your-super-secret-refresh-key-change-in-production")
	v.SetDefault("jwt.access_token_expiry", "15m")
	v.SetDefault("jwt.refresh_token_expiry", "168h") // 7 days
	v.SetDefault("jwt.reset_token_expiry", "1h")
	v.SetDefault("jwt.verify_token_expiry", "24h")
	v.SetDefault("jwt.issuer", "personal-finance-management")

	// CORS defaults
	v.SetDefault("cors.allow_origins", []string{"*"})
	v.SetDefault("cors.allow_methods", []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"})
	v.SetDefault("cors.allow_headers", []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"})
	v.SetDefault("cors.expose_headers", []string{"X-Request-ID"})
	v.SetDefault("cors.max_age", 86400)

	// Logger defaults
	v.SetDefault("logger.level", "debug")
	v.SetDefault("logger.format", "console")
	v.SetDefault("logger.output", "stdout")
	v.SetDefault("logger.time_format", "2006-01-02T15:04:05.000Z07:00")

	// Tracer defaults
	v.SetDefault("tracer.enabled", false)
	v.SetDefault("tracer.service_name", "cinemaos-backend")
	v.SetDefault("tracer.endpoint", "localhost:4317")
	v.SetDefault("tracer.insecure", true)
	v.SetDefault("tracer.sample_rate", 1.0)

}
