/**
 * A utility function to unwrap the response data from the backend.
 * Many original (Phase 1) endpoints use a wrapper `ApiResponse<T>` with `{ success, data, message }`.
 * Some new endpoints return the result (DTO, array, etc) directly via `Ok(result)`.
 * This function standardizes the returned payload by picking `.data` if wrapped seamlessly.
 */
export const unwrapResponse = <T>(res: any): T => {
    // If it's undefined/null, let it return
    if (!res) return res as T;

    // Check if the structure strictly looks like ApiResponse<T>
    if (
        typeof res === 'object' &&
        'success' in res &&
        'data' in res
    ) {
        if (res.success === false) {
            throw new Error(res.message || 'API responded with an error');
        }
        return res.data as T;
    }

    // Return naked array or object
    return res as T;
};
