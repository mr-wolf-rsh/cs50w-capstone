import {
    createSearchParams,
    useNavigate
} from "react-router-dom";

export default function useNavigateSearch() {
    const navigate = useNavigate();
    return (pathname, params) => {
        return navigate({
            pathname,
            ...(!!params && { search: `?${createSearchParams(params)}` })
        });
    }
}
