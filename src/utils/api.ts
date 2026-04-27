import {getApiUrl} from '../config/api';

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public timestamp?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<string> {
    const url = getApiUrl(endpoint);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            if (contentType?.includes('application/json')) {
                const errorData = await response.json();
                throw new ApiError(
                    errorData.message || 'Request failed',
                    errorData.status || response.status,
                    errorData.timestamp
                );
            }
            throw new ApiError(`HTTP ${response.status}`, response.status);
        }

        const text = await response.text();
        return text;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0
        );
    }
}

export async function apiRequestJson<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = getApiUrl(endpoint);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            if (contentType?.includes('application/json')) {
                const errorData = await response.json();
                throw new ApiError(
                    errorData.message || 'Request failed',
                    errorData.status || response.status,
                    errorData.timestamp
                );
            }
            throw new ApiError(`HTTP ${response.status}`, response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0
        );
    }
}

export function parseId(response: string, prefix: string): string {
    const parts = response.split(`${prefix}: `);
    if (parts.length > 1) {
        return parts[1].split('\n')[0].split(' ')[0].trim();
    }
    return '';
}
