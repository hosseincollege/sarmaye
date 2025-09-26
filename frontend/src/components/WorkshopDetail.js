import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Paper, Typography, Box, Button, Container, CircularProgress, Grid, Divider, Chip, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import { AuthContext } from "../AuthContext";

// آیکون‌ها
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import WidgetsIcon from '@mui/icons-material/Widgets';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

import { Bar, Line, Pie } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend
);



const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1301, cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <img src={imageUrl} alt="بزرگنمایی" style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
    </div>
  );
};



export default function WorkshopDetail() {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // ========= 🆕 استیت انتخاب متریک و ماه =========
  const [selectedMetric, setSelectedMetric] = useState("net_profit");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);


  const [modalImage, setModalImage] = useState(null);

  const openModal = (imageUrl) => setModalImage(imageUrl);
  const closeModal = () => setModalImage(null);


  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/workshops/${id}/`)
      .then(res => {
        setWorkshop(res.data);
      })
      .catch(err => {
        console.error("❌ خطا در گرفتن جزئیات:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);


  const getCategoryPersianName = (categoryKey) => {
    const categories = {
      industrial: "صنعتی",
      medical: "پزشکی",
      agriculture: "کشاورزی",
      livestock: "دامداری",
      software: "نرم‌افزار",
      hardware: "سخت‌افزار",
      electronics: "الکترونیک",
    };
    return categories[categoryKey] || "تعیین نشده";
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x250.png?text=No+Image';
    return path.startsWith("http") ? path : `${process.env.REACT_APP_API_URL}${path}`;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>در حال بارگذاری...</Typography>
    </Box>;
  }

  if (!workshop) {
    return (
      <Container sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="error">کارگاه پیدا نشد</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>بازگشت</Button>
      </Container>
    );
  }

  // آماده‌سازی داده‌ها برای نمودار
  // ========= 🆕 آماده‌سازی داده کامل ۱۲ ماه =========
  const monthNames = [
    "فروردین", "اردیبهشت", "خرداد",
    "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر",
    "دی", "بهمن", "اسفند"
  ];
  const currentYear = workshop.monthly_reports && workshop.monthly_reports.length > 0
  ? Math.max(...workshop.monthly_reports.map(r => r.year))
  : new Date().getFullYear();

  const fullYearData = monthNames.map((name, index) => {
    const realData = workshop.monthly_reports?.find(r =>
      r.month === index + 1 && r.year === currentYear
    );
    return {
      monthName: name,
      sales: realData?.sales || 0,
      gross_profit: realData?.gross_profit || 0,
      net_profit: realData?.net_profit || 0,
      profit_percentage: realData?.profit_percentage || 0,
      production_amount: realData?.production_amount || 0,
      sold_amount: realData?.sold_amount || 0
    };
  });


  // ========= 🆕 داده نمودار سالانه =========
  const yearlyChartData = {
    labels: fullYearData.map(r => r.monthName),
    datasets: [
      {
        type: 'bar',
        label: selectedMetric === "sales" ? "فروش" :
              selectedMetric === "gross_profit" ? "سود ناخالص" :
              selectedMetric === "net_profit" ? "سود خالص" : "",
        data: fullYearData.map(r => r[selectedMetric]),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ]
  };

  // ========= 🆕 داده نمودار ماهانه =========
  const monthDetail = fullYearData[selectedMonthIndex];

  // ۱. داده‌های مالی (تومان)
  const financialData = {
    labels: ["فروش", "سود ناخالص", "سود خالص"],
    datasets: [{
      label: `جزئیات مالی ${monthDetail.monthName}`,
      data: [monthDetail.sales, monthDetail.gross_profit, monthDetail.net_profit],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  // ۲. داده درصد سود
  const percentData = {
    labels: ["درصد سود"],
    datasets: [{
      label: `درصد سود ${monthDetail.monthName}`,
      data: [monthDetail.profit_percentage], // مثلا 35
      backgroundColor: 'rgba(255, 206, 86, 0.6)',
      barThickness: 30,
      maxBarThickness: 40
    }]
  };

  const percentOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,        // همیشه سقف محور Y برابر ۱۰۰
        ticks: {
          callback: value => value + "%"   // نمایش عدد با علامت درصد
        }
      }
    }
  };


  // ۳. داده تعداد (عدد)
  const quantityData = {
    labels: ["تولید", "فروش رفته"],
    datasets: [{
      label: `تعداد ${monthDetail.monthName}`,
      data: [monthDetail.production_amount, monthDetail.sold_amount],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    }]
  };


  const customerColors = [
            "rgba(76, 175, 80, 0.8)",   // سبز اصلی
            "rgba(56, 142, 60, 0.8)",   // سبز تیره‌تر
            "rgba(102, 187, 106, 0.8)", // سبز روشن‌تر
            "rgba(129, 212, 250, 0.8)", // آبی روشن
            "rgba(255, 202, 40, 0.8)"   // زرد
          ];



  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4, direction: "rtl" }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* هدر و بازگشت */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">{workshop.title}</Typography>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>بازگشت</Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={4}>
            {/* ستون راست: تصاویر */}
            <Grid 
              item 
              xs={12} 
              md={7} 
              sx={{ direction: 'rtl', textAlign: 'right' }}
            >

              <Box
                component="img"
                src={getImageUrl(workshop.cover_image)}
                alt={`کاور ${workshop.title}`}
                sx={{ width: '100%', height: 'auto', borderRadius: 2, mb: 2, boxShadow: 3 }}
              />
              {/* این بخش حیاتی برای نمایش تصاویر گالری است */}
              {workshop.images && workshop.images.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>گالری تصاویر</Typography>
                  <Grid container spacing={1}>
                    {workshop.images.map((img) => (
                      <Grid item xs={4} sm={3} key={img.id}>
                        <Box
                          component="img"
                          src={getImageUrl(img.image)}
                          alt="تصویر اضافی"
                          sx={{
                            width: '100%',
                            height: '70px',
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            transition: 'transform .2s',
                            '&:hover': { transform: 'scale(1.1)', boxShadow: 2 }
                          }}
                          onClick={() => openModal(getImageUrl(img.image))}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Grid>
            
            {/* ستون اطلاعات */}
            <Grid item xs={12} md={6} sx={{ textAlign: 'right', direction: 'rtl' }}>
              <Typography paragraph>{workshop.description}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} sx={{ textAlign: 'right', direction: 'rtl' }}>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <WidgetsIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="دسته‌بندی" secondary={getCategoryPersianName(workshop.category) || "ثبت نشده"} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <LocationCityIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="استان" secondary={workshop.address || "ثبت نشده"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <LocationOnIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="موقعیت مکانی" secondary={workshop.location || "ثبت نشده"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <StorefrontIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="نمایندگی فروش" secondary={workshop.sales_representative || "ثبت نشده"} />
                    </ListItem>


                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="تاریخ تاسیس" secondary={workshop.start_date || "ثبت نشده"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <CategoryIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="نوع محصول" secondary={workshop.product_type || "ثبت نشده"} />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6} sx={{ textAlign: 'right', direction: 'rtl' }}>
                  <List>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <TrendingUpIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="فروش سال گذشته" secondary={workshop.last_year_sales ? `${Number(workshop.last_year_sales).toLocaleString()} تومان` : "ثبت نشده"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <TrendingUpIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="سود سال گذشته" secondary={workshop.last_year_profit ? `${Number(workshop.last_year_profit).toLocaleString()} تومان` : "ثبت نشده"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <MonetizationOnIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="سرمایه مورد نیاز " secondary={workshop.required_capital ? `${Number(workshop.required_capital).toLocaleString()} تومان` : "ثبت نشده"} />
                    </ListItem>

                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText sx={{ textAlign: 'right' }} primary="شماره تماس" secondary={workshop.contact_number || "ثبت نشده"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <LanguageIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="وبسایت"
                        secondary={
                          workshop.website ? (
                            <a href={workshop.website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                              {workshop.website}
                            </a>
                          ) : "ثبت نشده"
                        }
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="ایمیل"
                        secondary={
                          workshop.email ? (
                            <a href={`mailto:${workshop.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                              {workshop.email}
                            </a>
                          ) : "ثبت نشده"
                        }
                      />
                    </ListItem>

                  </List>
                </Grid>
              </Grid>



                <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label={`پوشش سرمایه: ${workshop.funded_percentage}%`} color="warning" />
                <Chip label={`سود شما: ${workshop.profit_percentage}%`} color="info" />
              </Box>
              {workshop.contract_details && (
                  <Box mt={3}>
                      <Typography variant="h6"><InfoIcon sx={{verticalAlign: 'middle', mr: 1}}/>جزئیات قرارداد</Typography>
                      <Typography variant="body2" color="text.secondary">{workshop.contract_details}</Typography>
                  </Box>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* محصولات */}
          {workshop.products?.length > 0 && (
            <>
              <Typography variant="h5">📦 محصولات</Typography>
              {workshop.products.map((p, i) => {
                const monthlyVolume = Number(p.monthly_volume) || 0;

                // دیتاست سفارش‌دهنده‌ها با رنگ متفاوت
                const customerDatasets = (p.customers || []).map((c, idx) => ({
                  label: c.name,
                  data: [Number(c.monthly_order_volume) || 0],
                  backgroundColor: customerColors[idx % customerColors.length]
                }));

                const totalOrders = (p.customers || []).reduce(
                  (sum, c) => sum + (Number(c.monthly_order_volume) || 0), 0
                );
                const remaining = Math.max(monthlyVolume - totalOrders, 0);

                const barData = {
                  labels: [p.name],
                  datasets: [
                    ...customerDatasets,
                    {
                      label: "بدون سفارش قبلی",
                      data: [remaining],
                      backgroundColor: "rgba(224, 224, 224, 0.8)"
                    }
                  ]
                };

                const barOptions = {
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true, display: false, max: monthlyVolume },
                    y: { stacked: true, display: false }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: () => '',
                        label: (context) => {
                          const value = context.parsed.x ?? context.raw;
                          return `${context.dataset.label}: ${value} عدد`;
                        }
                      }
                    }
                  }
                };

                return (
                  <Box key={i} sx={{ mb: 1, p: 1, border: "1px solid #b7b7b7ff", borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography sx={{ flex: 1 }}>
                      <InventoryIcon sx={{ mr: 1 }} />
                      {p.name} - تولید ماهانه: {monthlyVolume} عدد
                    </Typography>
                    <Box sx={{ width: 300, height: 50 }}>
                      <Bar data={barData} options={barOptions} />
                    </Box>
                  </Box>
                );
              })}
            </>
          )}











          {/* نیروی انسانی */}
          {workshop.team_categories?.length > 0 && <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5">👥 نیروی انسانی</Typography>
            <ul>{workshop.team_categories.map((t, i) => <li key={i}>{t.category_name}: {t.count} نفر</li>)}</ul>
          </>}
          {workshop.manager && <>
            <Typography variant="h6"><AccountCircleIcon sx={{ mr: 1 }} /> مدیرعامل</Typography>
            <Typography>{workshop.manager.name} - {workshop.manager.description}</Typography>
          </>}

          {/* سرمایه‌گذاری‌ها */}
          {workshop.investments?.length > 0 && <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5">💰 بخش های سرمایه‌گذاری</Typography>
            {workshop.investments.map((inv, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                مبلغ: {Number(inv.amount).toLocaleString()} تومان - هدف: {inv.purpose} - سود: {inv.profit_percentage}% - بازگشت: {inv.return_duration_months} ماه
              </Box>
            ))}
          </>}

          {/* گزارش‌های ماهانه نسخه جدید */}
          {workshop.monthly_reports?.length > 0 && <>
            {/* نمودار سالانه */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5">📊 نمودار سالانه</Typography>

            <Box sx={{ my: 2 }}>
              <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
                <option value="sales">فروش</option>
                <option value="gross_profit">سود ناخالص</option>
                <option value="net_profit">سود خالص</option>
                <option value="profit_percentage">درصد سود</option>
                <option value="production_amount">تعداد تولید</option>
                <option value="sold_amount">تعداد فروش</option>
              </select>
            </Box>

            <Bar data={yearlyChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />

            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" sx={{ textAlign: 'right' }}>📊 نمودار ماهانه</Typography>

            <Box sx={{ my: 2 }}>
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                style={{ direction: 'rtl', textAlign: 'right' }}
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </Box>

            <Box sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-start',     // چینش نسبت به راست
              flexDirection: 'row-reverse',     // اولین نمودار سمت راست بیفته
              direction: 'rtl'                  // برای متن‌ها
            }}>
              <Box sx={{ width: 250, height: 250 }}>
                <Bar data={financialData} options={{ maintainAspectRatio: false, responsive: true }} />
              </Box>

              <Box sx={{ width: 100, height: 250 }}>
                <Bar data={percentData} options={percentOptions} />
              </Box>


              <Box sx={{ width: 200, height: 250 }}>
                <Bar
                  data={quantityData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    datasets: { bar: { barThickness: 40, maxBarThickness: 50 } }
                  }}
                />
              </Box>
            </Box>



          </>}

        </Paper>
      </Container>

      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
    </>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>{icon}</ListItemIcon>
    <ListItemText primary={label} secondary={value || '-'} />
  </Box>
);
