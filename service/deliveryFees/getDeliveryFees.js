import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const getLoginUserDetails = async () => {
  try {
    const url = `${getBaseUrl()}/fee/delivery/1`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("current user repsonse", response.data.userId);
    console.log("response ", response.data)

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
