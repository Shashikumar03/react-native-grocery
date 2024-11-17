import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const removeItemFromCart = async (userId,productId) => {
    try {
        console.log(userId,productId)
        const url = `${getBaseUrl()}/api/v1/carts/remove/${userId}/${productId}`;
        const response = await axios.put(url);
        // console.log(response.data)

        return {
            success: true,
            data: response.data,
            status: response.status,
        };

    }catch(error){
        const errorData = error.response ? error.response.data : { message: "Network error" };
        const errorStatus = error.response ? error.response.status : 500;

        return {
            success: false,
            data: errorData,
            status: errorStatus,
        };

    }
}