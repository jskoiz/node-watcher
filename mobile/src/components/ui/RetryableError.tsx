import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { spacing, radii, typography } from '../../theme/tokens';
import type { NormalizedApiError } from '../../api/errors';

interface RetryableErrorProps {
    error: NormalizedApiError;
    onRetry: () => void;
    /** Hide the retry button (e.g. for non-retryable errors). Defaults to `!error.retryable`. */
    hideRetry?: boolean;
}

const ICON_FOR_KIND: Record<string, React.ComponentProps<typeof Feather>['name']> = {
    forbidden: 'lock',
    not_found: 'search',
    rate_limited: 'clock',
    service_unavailable: 'cloud-off',
    server_error: 'alert-triangle',
    network: 'wifi-off',
};

const TITLE_FOR_KIND: Partial<Record<NormalizedApiError['kind'], string>> = {
    forbidden: 'Action unavailable',
    not_found: 'Content unavailable',
    rate_limited: 'Too many attempts',
    service_unavailable: 'Service temporarily unavailable',
    server_error: 'Server problem',
    network: 'Connection problem',
};

const GUIDANCE_FOR_KIND: Partial<Record<NormalizedApiError['kind'], string>> = {
    forbidden: 'You may need different permissions or a different account to continue.',
    not_found: 'Refresh the screen or go back if this content was removed.',
    rate_limited: 'Wait a moment before trying again.',
    service_unavailable: 'Please try again shortly.',
    server_error: 'Please try again in a moment.',
    network: 'Check your connection, then retry.',
};

export default function RetryableError({ error, onRetry, hideRetry }: RetryableErrorProps) {
    const theme = useTheme();
    const showRetry = !(hideRetry ?? !error.retryable);
    const [countdown, setCountdown] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-countdown when retryAfterSeconds is present
    useEffect(() => {
        if (error.retryAfterSeconds && error.retryAfterSeconds > 0 && showRetry) {
            setCountdown(error.retryAfterSeconds);
        } else {
            setCountdown(null);
        }
    }, [error.retryAfterSeconds, showRetry]);

    useEffect(() => {
        if (countdown === null || countdown <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [countdown !== null && countdown > 0]);

    const handleRetry = useCallback(() => {
        setCountdown(null);
        onRetry();
    }, [onRetry]);

    const iconName = ICON_FOR_KIND[error.kind] ?? 'alert-circle';
    const title = TITLE_FOR_KIND[error.kind] ?? 'Something went wrong';
    const guidance = GUIDANCE_FOR_KIND[error.kind];
    const isWaiting = countdown !== null && countdown > 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSoft, borderColor: theme.border }]}>
            <Feather name={iconName} size={28} color={theme.textMuted} style={styles.icon} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.textPrimary }]}>{error.message}</Text>
            {guidance ? (
                <Text style={[styles.guidance, { color: theme.textMuted }]}>{guidance}</Text>
            ) : null}

            {isWaiting && (
                <Text style={[styles.countdown, { color: theme.textMuted }]}>
                    Retry available in {countdown}s
                </Text>
            )}

            {showRetry && (
                <TouchableOpacity
                    onPress={handleRetry}
                    disabled={isWaiting}
                    accessibilityRole="button"
                    accessibilityLabel="Retry"
                    accessibilityState={{ disabled: isWaiting }}
                    style={[
                        styles.button,
                        { backgroundColor: isWaiting ? theme.borderSoft : theme.primary },
                    ]}
                >
                    <Feather name="refresh-cw" size={16} color={isWaiting ? theme.textMuted : theme.textInverse} />
                    <Text
                        style={[
                            styles.buttonText,
                            { color: isWaiting ? theme.textMuted : theme.textInverse },
                        ]}
                    >
                        Try again
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderRadius: radii.md,
        borderWidth: 1,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xl,
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.xxxl,
    },
    icon: {
        marginBottom: spacing.md,
    },
    message: {
        fontSize: typography.body,
        fontWeight: '500',
        lineHeight: 22,
        textAlign: 'center',
    },
    title: {
        fontSize: typography.body,
        fontWeight: '700',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    guidance: {
        fontSize: typography.bodySmall,
        lineHeight: 20,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    countdown: {
        fontSize: typography.caption,
        marginTop: spacing.sm,
    },
    button: {
        alignItems: 'center',
        borderRadius: radii.sm,
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    buttonText: {
        fontSize: typography.bodySmall,
        fontWeight: '600',
    },
});
