import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Button,
  Container,
  Box,
  CircularProgress,
  Stack,
  CardActionArea,
  Divider,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

export default function WorkshopList() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const categories = {
    industrial: "صنعتی",
    medical: "پزشکی",
    agriculture: "کشاورزی",
    livestock: "دامداری",
    software: "نرم‌افزار",
    hardware: "سخت‌افزار",
    electronics: "الکترونیک",
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/workshops/`)
      .then((res) => setWorkshops(res.data))
      .catch((err) =>
        console.error("❌ خطا در گرفتن لیست:", err.response?.data || err.message)
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این کارگاه را حذف کنید؟")) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/workshops/${id}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        });
        setWorkshops(workshops.filter((w) => w.id !== id));
      } catch (err) {
        console.error("❌ خطا در حذف کارگاه:", err);
      }
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.REACT_APP_API_URL}${path}`;
  };

  const filteredWorkshops = workshops.filter(
    (workshop) => selectedCategory === "all" || workshop.category === selectedCategory
  );

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>در حال بارگذاری کارگاه‌ها...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: "rtl" }}>
      {/* ======== هدر بالای صفحه ======== */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
        {/* فیلتر دسته‌بندی */}
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}
        >
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="category-filter-label">فیلتر دسته‌بندی</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter-select"
              value={selectedCategory}
              label="فیلتر دسته‌بندی"
              onChange={handleCategoryChange}
              sx={{
                "& .MuiSelect-select": { textAlign: "right" },
              }}
              MenuProps={{
                PaperProps: { sx: { direction: "rtl" } },
              }}
            >
              <MenuItem value="all">
                <em>همه دسته‌بندی‌ها</em>
              </MenuItem>
              {Object.entries(categories).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* عنوان */}
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ textAlign: "center", order: { xs: -1, sm: 0 } }}
        >
          <Typography variant="h5" component="h1" fontWeight="bold">
            لیست کارگاه‌ها
          </Typography>
        </Grid>

        {/* دکمه‌ها */}
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" } }}
        >
          <Stack direction="row" spacing={1.5}>
            {!currentUser ? (
              <>
                <Button variant="outlined" color="primary" onClick={() => navigate("/login")}>
                  ورود
                </Button>
                <Button variant="contained" color="secondary" onClick={() => navigate("/register")}>
                  ثبت‌نام
                </Button>
              </>
            ) : (
              <Button variant="contained" color="success" onClick={() => navigate("/create")}>
                ایجاد کارگاه جدید
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* ======== کارت‌ها ======== */}
      {filteredWorkshops.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {selectedCategory === "all"
              ? "هیچ کارگاهی برای نمایش وجود ندارد."
              : `هیچ کارگاهی در این دسته‌بندی یافت نشد.`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredWorkshops.map((workshop) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={workshop.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 340,
                  height: 400, // 👈 ارتفاع ثابت برای یک‌اندازه بودن همه کارت‌ها
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between", // 👈 محتوا بالا، دکمه‌ها پایین
                  boxShadow: 3,
                  overflow: "hidden",
                  transition: "all 0.25s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                }}
              >


                <CardActionArea
                  onClick={() => navigate(`/workshops/${workshop.id}`)}
                  sx={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={
                      getImageUrl(workshop.cover_image) ||
                      "https://via.placeholder.com/350x150.png?text=No+Image"
                    }
                    alt={`کاور ${workshop.title}`}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography gutterBottom variant="subtitle1" fontWeight="bold" color="primary.main">
                      {workshop.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        flexGrow: 1,
                        lineHeight: 1.6,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {workshop.description}
                    </Typography>


                    <Divider sx={{ mb: 1 }} />

                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CategoryOutlinedIcon fontSize="small" />
                        <Typography variant="body2">
                          دسته‌بندی: {categories[workshop.category] || "نامشخص"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnOutlinedIcon fontSize="small" />
                        <Typography variant="body2">
                          استان: {workshop.province || "نامشخص"}
                        </Typography>
                      </Stack>

                    </Stack>
                  </CardContent>
                </CardActionArea>

                {currentUser?.username === workshop.owner?.username && (
                  <Box
                    sx={{
                      p: 1.5,
                      display: "flex",
                      gap: 1,
                      backgroundColor: "grey.50",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit/${workshop.id}`);
                      }}
                    >
                      ویرایش
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={(e) => handleDelete(workshop.id, e)}
                    >
                      حذف
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
