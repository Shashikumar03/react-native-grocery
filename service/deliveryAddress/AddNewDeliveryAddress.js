import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";
import { getToken } from "../../utils/token";

export const addNewDeliveryAddress = async (userId, payload) => {
  try {
    const token = await getToken(); // Get token from secure storage
    const url = `${getBaseUrl()}/api/delivery-address/${userId}`;

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
        "Content-Type": "application/json"
      },
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const errorData = error.response ? error.response.data : { message: "Network error" };
    const errorStatus = error.response ? error.response.status : 500;

    return {
      success: false,
      data: errorData,
      status: errorStatus,
    };
  }
};
