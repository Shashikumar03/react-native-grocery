import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const getCartItems = async () => {
    try {
        const userId = 1;
        const url = `${getBaseUrl()}/api/v1/carts/${userId}`;
        
        const response = await axios.get(url)

        return {
            success: true,
            data: response.data,
            status: response.status,
        }

    } catch (error) {
        const errorData = error.response ? error.response.data : { message: "Network error" };
        const errorStatus = error.response ? error.response.status : 500;

        return {
            success: false,
            data: errorData,
            status: errorStatus,
        };

    }


}