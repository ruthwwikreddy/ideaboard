import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackToHome = () => {
    const navigate = useNavigate();

    return (
        <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 hover:bg-secondary/50 group"
        >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
        </Button>
    );
};

export default BackToHome;
