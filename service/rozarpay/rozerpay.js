import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const getPaymentOrder = async (userId,addressId , paymentMode) => {
    try {
      // const userId=1
      // const addressId=3
      console.log("shashi userId", userId, "addressId", addressId, "paymentMode", paymentMode)
      const url = `${getBaseUrl()}/api/place-order/${userId}/${addressId}?paymentMode=${paymentMode}`;
      const response = await axios.post(url)
      console.log("payment response data",response.data)
      return {
          success: true,
          data: response.data,
          status: response.status,
      }

    } catch (error) {
      const errorData = error.response ? error.response.data : { message: "Network error" };
      const errorStatus = error.response ? error.response.status : 500;
      // console.error("Error fetching payment order:", error.response.data);

      return {
          success: false,
          data: errorData,
          status: errorStatus,
      }
    }
  }