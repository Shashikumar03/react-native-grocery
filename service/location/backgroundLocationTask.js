/**
 * Background location task – must be defined at top level and imported at app load
 * (e.g. in app/_layout.jsx) so TaskManager knows the handler before startLocationUpdatesAsync.
 *
 * When the app is in background or closed (with limits: Android may kill; iOS can wake for geofence),
 * the system may deliver location updates and this task runs to send them to the backend.
 */
import * as TaskManager from 'expo-task-manager';
import { getBaseUrl } from '../../constants/Baseurl';
import { getToken } from '../../utils/token';

const BACKGROUND_LOCATION_TASK_NAME = 'background-location-task';

async function sendLocationToBackendFromTask(latitude, longitude) {
  try {
    const token = await getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    await fetch(`${getBaseUrl()}/api/location`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        latitude,
        longitude,
        time: new Date().toISOString(),
      }),
    });
  } catch (_) {
    // Silently ignore; avoid crashing the task
  }
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error.message);
    return;
  }
  if (!data || !data.locations || !Array.isArray(data.locations)) return;

  for (const location of data.locations) {
    const { latitude, longitude } = location.coords || {};
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      await sendLocationToBackendFromTask(latitude, longitude);
    }
  }
});

export { BACKGROUND_LOCATION_TASK_NAME };
