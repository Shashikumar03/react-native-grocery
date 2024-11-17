import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const getAllCategories = async () => {
    try {
    
        const url = `${getBaseUrl()}/api/category/all`;
        const response = await axios.get(url);
        // console.log(response.data)
        return {
            success: true,
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        // Handle cases where error.response might be undefined
        const errorData = error.response ? error.response.data : { message: "Network error" };
        const errorStatus = error.response ? error.response.status : 500;

        return {
            success: false,
            data: errorData,
            status: errorStatus,
        };
    }

}