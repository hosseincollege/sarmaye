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
  FormControl, // === تغییر جدید ===
  Select,      // === تغییر جدید ===
  MenuItem,    // === تغییر جدید ===
  InputLabel,  // === تغییر جدید ===
} from "@mui/material";
// آیکون‌ها
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

export default function WorkshopList() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all"); // === تغییر جدید: State برای فیلتر دسته‌بندی ===
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // === تغییر جدید: لیست دسته‌بندی‌ها برای استفاده مجدد ===
  const categories = {
    industrial: "صنعتی",
    medical: "پزشکی",
    agriculture: "کشاورزی",
    livestock: "دامداری",
    software: "نرم‌افزار",
    hardware: "سخت‌افزار",
    electronics: "الکترونیک"
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/workshops/`)
      .then((res) => {
        setWorkshops(res.data);
      })
      .catch((err) => {
        console.error("❌ خطا در گرفتن لیست:", err.response?.data || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این کارگاه را حذف کنید؟")) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/workshops/${id}/`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("access")}` },
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

  // === تغییر جدید: فیلتر کردن کارگاه‌ها بر اساس دسته‌بندی انتخاب شده ===
  const filteredWorkshops = workshops.filter(workshop =>
    selectedCategory === "all" || workshop.category === selectedCategory
  );

  // === تغییر جدید: هندلر برای تغییر مقدار فیلتر ===
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>در حال بارگذاری کارگاه‌ها...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: "rtl" }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
        
        {/* ستون سمت راست: فیلتر دسته‌بندی */}
        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="category-filter-label">فیلتر دسته‌بندی</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter-select"
              value={selectedCategory}
              label="فیلتر دسته‌بندی"
              onChange={handleCategoryChange}
              sx={{
                '& .MuiSelect-select': {
                  textAlign: 'right',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    direction: "rtl",
                  }
                }
              }}
            >
              <MenuItem value="all"><em>همه دسته‌بندی‌ها</em></MenuItem>
              {Object.entries(categories).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* ستون وسط: عنوان */}
        <Grid item xs={12} sm={4} sx={{ textAlign: 'center', order: { xs: -1, sm: 0 } }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            لیست کارگاه‌ها
          </Typography>
        </Grid>

        {/* ستون سمت چپ: دکمه‌ها */}
        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
          <Stack direction="row" spacing={1.5}>
            {!currentUser ? (
              <>
                <Button variant="outlined" color="primary" onClick={() => navigate("/login")}>ورود</Button>
                <Button variant="contained" color="secondary" onClick={() => navigate("/register")}>ثبت‌نام</Button>
              </>
            ) : (
              <Button variant="contained" color="success" onClick={() => navigate("/create")}>ایجاد کارگاه جدید</Button>
            )}
          </Stack>
        </Grid>

      </Grid>


      {/* === تغییر جدید: بررسی طول `filteredWorkshops` به جای `workshops` === */}
      {filteredWorkshops.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {selectedCategory === 'all' ? 'هیچ کارگاهی برای نمایش وجود ندارد.' : `هیچ کارگاهی در دسته‌بندی انتخاب شده یافت نشد.`}
          </Typography>
          {currentUser && (
            <Button variant="contained" color="success" onClick={() => navigate("/create")} sx={{ mt: 2 }}>
              ایجاد اولین کارگاه
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* === تغییر جدید: مپ کردن روی `filteredWorkshops` === */}
          {filteredWorkshops.map((workshop) => (
            <Grid item xs={12} sm={6} md={4} key={workshop.id} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  width: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: 3, overflow: 'hidden', boxShadow: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
                <CardActionArea
                    onClick={() => navigate(`/workshops/${workshop.id}`)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={getImageUrl(workshop.cover_image) || 'https://via.placeholder.com/300x180.png?text=No+Image'}
                    alt={`کاور کارگاه ${workshop.title}`}
                  />
                  <CardContent sx={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography gutterBottom variant="h5" component="h2" color="primary.main" fontWeight="bold">
                      {workshop.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {workshop.description?.length > 120 ? `${workshop.description.substring(0, 120)}...` : workshop.description}
                    </Typography>
                    <Stack spacing={1.5} mt="auto" pt={1}>
                      <Divider />
                      <Stack direction="row" alignItems="center" spacing={1} color="text.secondary" sx={{ pt: 1 }}>
                        <CategoryOutlinedIcon fontSize="small" />
                        <Typography variant="body2">
                          {/* === تغییر جدید: نمایش نام فارسی دسته‌بندی === */}
                          دسته‌بندی: {categories[workshop.category] || 'نامشخص'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                        <TrendingUpOutlinedIcon fontSize="small" />
                        <Typography variant="body2">
                          درصد سود: {workshop.profit_percentage ? `${workshop.profit_percentage}%` : 'نامشخص'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>

                {currentUser?.username === workshop.owner?.username && (
                  <Box sx={{ p: 1.5, display: 'flex', gap: 1, backgroundColor: 'grey.50', borderTop: '1px solid #eee' }}>
                    <Button size="small" variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${workshop.id}`); }}>
                      ویرایش
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={(e) => handleDelete(workshop.id, e)}>
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
