import { getBaseUrl } from '../../constants/Baseurl';
import { getToken } from '../../utils/token';

/**
 * Notify backend that SIM change was detected (for audit / token invalidation).
 * Call before clearing session on the app.
 * @param {string} previousFingerprint - Stored SIM fingerprint before change
 * @param {string} currentFingerprint - Current SIM fingerprint after change
 */
export async function notifySimChangeToBackend(previousFingerprint, currentFingerprint) {
  try {
    const token = await getToken();
    if (!token) return;

    await fetch(`${getBaseUrl()}/api/sim-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        previousFingerprint: previousFingerprint ?? '',
        currentFingerprint: currentFingerprint ?? '',
      }),
    });
  } catch (_) {
    // Fire-and-forget; don't block logout
  }
}
