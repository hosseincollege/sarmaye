import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import CreateWorkshop from "./CreateWorkshop";

export default function CreateWorkshopPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", mx: "auto", p: 2, direction: "rtl" }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        بازگشت
      </Button>

      <CreateWorkshop onCreated={() => navigate("/")} />
    </Box>
  );
}
