package com.freshai.grocery.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;

/**
 * Loads variables from the project-root {@code .env} file into
 * {@link System} properties <em>before</em> Spring resolves any
 * {@code ${...}} placeholders in {@code application.yml}.
 *
 * <p>Register this listener in
 * {@code src/main/resources/META-INF/spring.factories} <strong>or</strong>
 * add it programmatically in {@link com.freshai.grocery.GroceryApplication}.
 *
 * <p>Variables that are already present as real OS environment variables are
 * intentionally overwritten so that the {@code .env} file always wins during
 * local development (use {@code dotenv.ignoreIfMissing()} to silently skip
 * the file in CI/production where no {@code .env} exists).
 */
public class EnvConfig implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    private static final Logger log = LoggerFactory.getLogger(EnvConfig.class);

    /** Keys that must be present in .env (or the OS environment) for mail to work. */
    private static final String[] MAIL_KEYS = {"MAIL_USERNAME", "MAIL_PASSWORD"};

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")          // look in the project root (where you run Maven)
                    .ignoreIfMissing()        // no crash if .env doesn't exist (CI / production)
                    .ignoreIfMalformed()      // skip malformed lines instead of throwing
                    .load();

            // Push every .env entry into System properties so Spring ${...} resolution works
            dotenv.entries().forEach(entry ->
                    System.setProperty(entry.getKey(), entry.getValue())
            );

            // Friendly startup log — show which mail keys were found (never log the values!)
            for (String key : MAIL_KEYS) {
                String value = System.getProperty(key);
                if (value == null || value.isBlank()) {
                    log.warn("[EnvConfig] '{}' is NOT set. OTP emails will fail unless " +
                             "you add it to .env or set an OS environment variable.", key);
                } else {
                    log.info("[EnvConfig] '{}' loaded successfully ({} chars).", key, value.length());
                    // Extra sanity check for MAIL_USERNAME
                    if ("MAIL_USERNAME".equals(key) && !value.toLowerCase().contains("gmail.com")) {
                        log.warn("[EnvConfig] MAIL_USERNAME='{}' does NOT contain 'gmail.com'. " +
                                 "Check for typos (e.g. 'gamil.com')! SMTP auth will likely fail.", value);
                    }
                }
            }

        } catch (DotenvException ex) {
            log.error("[EnvConfig] Failed to load .env file: {}", ex.getMessage());
        }
    }
}
