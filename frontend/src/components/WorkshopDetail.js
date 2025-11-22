import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Paper, Typography, Box, Button, Container, CircularProgress, Grid, Divider, Chip,
  List, ListItem, ListItemIcon, ListItemText,
  FormControl, InputLabel, Select, MenuItem, TextField
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
import FactoryIcon from '@mui/icons-material/Factory';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import InsertChartIcon from "@mui/icons-material/InsertChart";

import {
  HomeWork as HomeWorkIcon,           // اجاره زمین و ساخت کارگاه
  PrecisionManufacturing as MachineIcon, // اجاره تجهیزات
  Handyman as HandymanIcon,           // تعمیرات و نگهداری
  Paid as PaidIcon                    // جمع هزینه‌ها
} from "@mui/icons-material";


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

import PeopleIcon from '@mui/icons-material/People';
import moment from "moment-jalaali";



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

  const [selectedYear, setSelectedYear] = useState(() => {
    if (workshop?.monthly_reports?.length) {
      return Math.max(...workshop.monthly_reports.map(r => r.year));
    } else {
      return new Date().getFullYear();
    }
  });

  const [selectedMonth, setSelectedMonth] = useState('');
  const [investorAmount, setInvestorAmount] = useState(0);
  // 🟢 اگر workshop هنوز نیومده بود، آرایه‌ها خالی بمونن
  const availableYears = Array.isArray(workshop?.monthly_reports)
    ? [...new Set(workshop.monthly_reports.map(r => r.year))].sort((a, b) => b - a)
    : [];

  const availableMonths = Array.isArray(workshop?.monthly_reports)
    ? workshop.monthly_reports
        .filter(r => r.year === parseInt(selectedYear))
        .map(r => r.month)
    : [];


  // ⚙️ تعیین سال و ماه پیش‌فرض بر اساس تاریخ شمسی فعلی
  useEffect(() => {
    if (!Array.isArray(workshop?.monthly_reports)) return;

    const nowJalali = moment();
    const currentYear = parseInt(nowJalali.jYear());
    const currentMonth = parseInt(nowJalali.jMonth() + 1);

    let prevMonth = currentMonth - 1;
    let yearToSelect = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      yearToSelect -= 1;
    }

    const hasReport = workshop.monthly_reports.find(
      (r) => r.year === yearToSelect && r.month === prevMonth
    );

    if (hasReport) {
      setSelectedYear(yearToSelect);
      setSelectedMonth(prevMonth);
    } else {
      const latestYear = Math.max(...workshop.monthly_reports.map(r => r.year));
      const monthsOfYear = workshop.monthly_reports
        .filter(r => r.year === latestYear)
        .map(r => r.month);
      if (monthsOfYear.length > 0) {
        setSelectedYear(latestYear);
        setSelectedMonth(monthsOfYear[monthsOfYear.length - 1]);
      }
    }
  }, [workshop?.monthly_reports]);

  



  const [modalImage, setModalImage] = useState(null);
  const [factoryType, setFactoryType] = useState("");
  const [investorShareRatio, setInvestorShareRatio] = useState(0);
  const [investorProfitOrLoss, setInvestorProfitOrLoss] = useState(0);
  const [baseRatio, setBaseRatio] = useState(0); // نسبت آورده سرمایه‌گذار به سرمایه کل

  const [netProfitThisMonth, setNetProfitThisMonth] = useState(0);


  


  const openModal = (imageUrl) => setModalImage(imageUrl);
  const closeModal = () => setModalImage(null);



  // ========= محاسبه خودکار فقط برای نمایش سود کارگاه =========
  useEffect(() => {
    if (!workshop || !Array.isArray(workshop.monthly_reports) || !selectedYear || !selectedMonth) return;

    const monthReport = workshop.monthly_reports.find(
      (r) => r.year === parseInt(selectedYear) && r.month === parseInt(selectedMonth)
    );

    const currentNetProfit = monthReport ? Number(monthReport.profit || 0) : 0;
    setNetProfitThisMonth(currentNetProfit);
  }, [workshop, selectedYear, selectedMonth]);



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

  // وقتی داده‌ی workshop میاد، تنظیم کن تا فروش همون اول نمایش داده بشه
  useEffect(() => {
    if (workshop?.monthly_reports?.length > 0) {
      const latestYear = Math.max(...workshop.monthly_reports.map(r => r.year));
      setSelectedYear(latestYear);
      setSelectedMetric("sales"); // پیش‌فرض: نمودار فروش
    }
  }, [workshop]);




  // ✅ جلوگیری از رندر قبل از لود داده‌ها
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>در حال بارگذاری...</Typography>
      </Box>
    );
  }

  if (!workshop) {
    return (
      <Container sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="error">کارگاه پیدا نشد</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>بازگشت</Button>
      </Container>
    );
  }



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

  // ✅ محاسبه تعداد کل نیروها = مجموع تیم‌ها + مدیرعامل
  const totalMembers =
    (workshop.team_categories?.reduce((sum, t) => sum + t.count, 0) || 0)
    + (workshop.manager ? 1 : 0);


  // آماده‌سازی داده‌ها برای نمودار
  // ========= 🆕 آماده‌سازی داده کامل ۱۲ ماه =========
  const monthNames = [
    "فروردین", "اردیبهشت", "خرداد",
    "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر",
    "دی", "بهمن", "اسفند"
  ];
  const currentYear = workshop?.monthly_reports?.length > 0
    ? Math.max(...workshop.monthly_reports.map(r => r.year))
    : new Date().getFullYear();

  const fullYearData = monthNames.map((name, index) => {
    const realData = workshop?.monthly_reports?.find(r =>
      r.month === index + 1 && r.year === (selectedYear || currentYear)
    );

    return {
      monthName: name,
      sales: realData?.sales ?? 0,
      profit: realData?.profit ?? 0,
      profit_percentage: realData?.profit_percentage ?? 0,
      production_amount: realData?.production_amount ?? 0,
      sold_amount: realData?.sold_amount ?? 0,
      fixed_workshop_rent: realData?.fixed_workshop_rent ?? 0,
      equipment_rent: realData?.equipment_rent ?? 0,
      material_costs: realData?.material_costs ?? 0,
      salary_maintenance: realData?.salary_maintenance ?? 0,
      total_monthly_value: realData?.total_monthly_value ?? 0,
    };
  });




  // ========= 🆕 داده نمودار سالانه =========
  const yearlyChartData = {
    labels: fullYearData.map(r => r.monthName),
    datasets: [
      {
        type: 'bar',
        label: selectedMetric === "sales" ? "فروش" :
              selectedMetric === "profit" ? "سود" : "",
        data: fullYearData.map(r => r[selectedMetric]),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ]
  };

  // ========= 🆕 داده نمودار ماهانه =========
  const monthDetail = Array.isArray(workshop?.monthly_reports)
    ? workshop.monthly_reports.find(
        (r) => r.year === parseInt(selectedYear) && r.month === parseInt(selectedMonth)
      )
    : null;

  // 🟢 اگه هیچ ماهی انتخاب نشده باشه، داده‌ی خالی بساز تا ارور نده
  const safeMonthDetail = monthDetail || {
    monthName: "",
    sales: 0,
    profit: 0,
    production_amount: 0,
  };


  const calculatedNetProfit =
    Number(safeMonthDetail.sales || 0) - (monthDetail?.total_monthly_value || 0);


  const financialData = {
    labels: ["فروش", "سود", "اجاره زمین و ساخت",
      "اجاره تجهیزات",
      "مواد اولیه",
      "حقوق و نگهداری",
      "ارزش کل ماهانه"],
    datasets: [{
      label: safeMonthDetail.monthName
        ? `جزئیات مالی ${safeMonthDetail.monthName}`
        : "جزئیات مالی",
      data: [
        safeMonthDetail.sales,
        calculatedNetProfit,
        monthDetail?.fixed_workshop_rent || 0,
        monthDetail?.equipment_rent || 0,
        monthDetail?.material_costs || 0,
        monthDetail?.salary_maintenance || 0,
        monthDetail?.total_monthly_value || 0,
      ],
      backgroundColor: ['rgba(100, 181, 246, 0.8)', 'rgba(129, 199, 132, 0.8)', "#42a5f5",
        "#64b5f6",
        "#81c784",
        "#ffb74d",
        "#ba68c8"],
      barThickness: 60,
    }]
  };





  const customerColors = [
            "rgba(76, 175, 80, 0.8)",   // سبز اصلی
            "rgba(56, 142, 60, 0.8)",   // سبز تیره‌تر
            "rgba(102, 187, 106, 0.8)", // سبز روشن‌تر
            "rgba(129, 212, 250, 0.8)", // آبی روشن
            "rgba(255, 202, 40, 0.8)"   // زرد
          ];


  // پیدا کردن گزارش ماه انتخابی
  const monthReport = workshop.monthly_reports.find(
    (r) => r.year === (selectedYear || currentYear) && r.month === selectedMonth
  );

  // ✅ این خط را در اینجا اضافه کنید
  const investorReturnPercentage =
      investorAmount > 0 ? (investorProfitOrLoss / investorAmount) * 100 : 0;


          



  return (
    <>
      <Container maxWidth="xl" sx={{ px: 4, py: 4, direction: "rtl" }}>
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
                      <Grid item xs={6} key={img.id}> {/* xs=6 یعنی نصف عرض => دو ستون */}
                        <Box
                          component="img"
                          src={getImageUrl(img.image)}
                          alt="تصویر اضافی"
                          sx={{
                            width: '100%',
                            height: '100px',
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
            <Grid item xs={12} md={4} sx={{ textAlign: 'right', direction: 'rtl' }}>
              <Typography paragraph>
                <strong>توضیحات:</strong> {workshop.description || "—"}
              </Typography>
              <Typography paragraph>
                <strong>نوع محصول:</strong> {workshop.product_type || "—"}
              </Typography>

              {/* پنج ستون، هر کدام دو ردیف */}
              <Grid container spacing={2}>

                {/* ستون ۱: دسته‌بندی + استان */}
                <Grid item xs={12} md={2.4} sx={{ textAlign: 'right', direction: 'rtl' }}>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <WidgetsIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="دسته‌بندی"
                        secondary={getCategoryPersianName(workshop.category) || "ثبت نشده"}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <LocationCityIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="استان"
                        secondary={workshop.province || "ثبت نشده"}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {/* ستون ۲: نوع مالکیت + تماس */}
                <Grid item xs={12} md={2.4} sx={{ textAlign: 'right', direction: 'rtl' }}>
                  <List>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="نوع مالکیت"
                        secondary={workshop.ownership_type || "ثبت نشده"}
                      />
                    </ListItem>

                    

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="شماره تماس"
                        secondary={workshop.contact_number || "ثبت نشده"}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {/* ستون ۳: وبسایت + ایمیل */}
                <Grid item xs={12} md={2.4} sx={{ textAlign: 'right', direction: 'rtl' }}>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <LanguageIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="وب‌سایت"
                        secondary={
                          workshop.website ? (
                            <a
                              href={workshop.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                              {workshop.website}
                            </a>
                          ) : "ثبت نشده"
                        }
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="ایمیل"
                        secondary={
                          workshop.email ? (
                            <a
                              href={`mailto:${workshop.email}`}
                              style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                              {workshop.email}
                            </a>
                          ) : "ثبت نشده"
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                {/* ستون ۴: نیروها + مساحت */}
                <Grid item xs={12} md={2.4} sx={{ textAlign: 'right', direction: 'rtl' }}>
                  <List>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="تعداد نیروها"
                        secondary={`${totalMembers} نفر`}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <SquareFootIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="مساحت کارگاه/سالن"
                        secondary={
                          workshop.area
                            ? `${Number(workshop.area).toLocaleString()} متر مربع`
                            : "ثبت نشده"
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                {/* ستون ۵: سرمایه + تاریخ */}
                <Grid item xs={12} md={2.4} sx={{ textAlign: 'right', direction: 'rtl' }}>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <MonetizationOnIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="سرمایه مورد نیاز"
                        secondary={
                          workshop.required_capital
                            ? `${Number(workshop.required_capital).toLocaleString()} تومان`
                            : "ثبت نشده"
                        }
                      />
                    </ListItem>


                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: 'right' }}
                        primary="تاریخ تأسیس"
                        secondary={workshop.start_date || "ثبت نشده"}
                      />
                    </ListItem>

                    
                  </List>
                </Grid>
                

              </Grid>





                <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {/* سمت راست: موقعیت مکانی و نمایندگی */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List sx={{ direction: 'rtl' }}>
                      {/* موقعیت مکانی */}
                      <ListItem
                        sx={{
                          direction: 'rtl',
                          alignItems: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row-reverse',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                          <LocationOnIcon />
                        </ListItemIcon>
                        <ListItemText
                          sx={{ textAlign: 'right' }}
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              موقعیت مکانی
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {workshop.location || "ثبت نشده"}
                            </Typography>
                          }
                        />
                      </ListItem>

                      {/* نمایندگی فروش اختصاصی */}
                      <ListItem
                        sx={{
                          direction: 'rtl',
                          alignItems: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row-reverse',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 'unset', ml: 1 }}>
                          <StorefrontIcon />
                        </ListItemIcon>
                        <ListItemText
                          sx={{ textAlign: 'right' }}
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              نمایندگی فروش اختصاصی
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {workshop.sales_representative
                                ? `آدرس: ${workshop.sales_representative}`
                                : "ثبت نشده"}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                {/* سمت چپ: سرمایه‌گذاری‌ها */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ direction: 'rtl',
                          alignItems: 'flex-end',
                          display: 'flex',
                          flexDirection: 'row-reverse',
                          fontWeight: 'bold', mb: 1, textAlign: 'left' }}
                    >
                       💰 بخش‌های سرمایه‌گذاری
                    </Typography>

                    {workshop.investments?.length > 0 ? (
                      workshop.investments.map((inv, i) => (
                        <Box
                          key={i}
                          sx={{
                            mb: 1,
                            textAlign: 'right',
                            borderBottom: '1px dashed #ddd',
                            pb: 0.5,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                            مبلغ: {Number(inv.amount).toLocaleString()} تومان
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                            هدف: {inv.purpose}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="right">
                        هیچ بخش سرمایه‌گذاری ثبت نشده است.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>



          <Divider sx={{ my: 2 }}>
            <Chip label="محاسبه بازدهی سرمایه‌گذاری بر اساس عملکرد ماه‌های قبل" />
          </Divider>

          {/* 🆕 بخش انتخاب سال، ماه و مبلغ سرمایه‌گذاری */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>

            {/* انتخاب سال */}
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>سال</InputLabel>
              <Select
                value={selectedYear || currentYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from(new Set(workshop.monthly_reports.map(r => r.year))).map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* انتخاب ماه */}
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>ماه</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthNames.map((name, i) => (
                  <MenuItem key={i} value={i + 1}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* مبلغ سرمایه‌گذاری */}
            <TextField
              label="مبلغ سرمایه‌گذاری شما"
              value={investorAmount ? investorAmount.toLocaleString() + ' تومان' : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setInvestorAmount(raw ? Number(raw) : 0);
              }}
            />

            {/* دکمه محاسبه */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const monthReport = workshop.monthly_reports.find(
                  (r) =>
                    parseInt(r.year) === parseInt(selectedYear || currentYear) &&
                    parseInt(r.month) === parseInt(selectedMonth)
                );

                if (!monthReport) {
                  setNetProfitThisMonth(0);
                  setBaseRatio(0);
                  setInvestorShareRatio(0);
                  setInvestorProfitOrLoss(0);
                  return;
                }

                // سود خالص ماه انتخابی
                const calculatedNetProfitThisMonth = Number(monthReport.profit || 0);
                setNetProfitThisMonth(calculatedNetProfitThisMonth);

                // کل سرمایه آن ماه
                const total_monthly_value = Number(monthReport.total_monthly_value || 0);

                // درصد مشارکت سرمایه‌گذار از سود ماهانه
                const newInvestorShareRatio =
                  total_monthly_value > 0
                    ? investorAmount / (investorAmount + total_monthly_value)
                    : 0;
                setInvestorShareRatio(newInvestorShareRatio);

                // محاسبه سود یا زیان سرمایه‌گذار
                const newInvestorProfitOrLoss = calculatedNetProfitThisMonth * newInvestorShareRatio;
                setInvestorProfitOrLoss(newInvestorProfitOrLoss);
              }}

            >
              محاسبه
            </Button>

          </Box>



          <Typography sx={{ mt: 2 }}>
            سود کارگاه در {monthNames[selectedMonth - 1]} {selectedYear || currentYear}:
            <strong> {netProfitThisMonth.toLocaleString()} </strong> تومان
          </Typography>


          {/* کادر رنگی */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, my: 2 }}>

          {/* 🔹 درصد مشارکت سرمایه‌گذار (آبی) */}
          <Chip
            label={`درصد مشارکت سرمایه‌گذار: ${(investorShareRatio * 100).toFixed(2)}%`}
            color="info"
            sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
          />

          {/* 🔻 سود یا زیان سرمایه‌گذار */}
          <Chip
            label={`سود یا زیان سرمایه‌گذار در شرایط مشابه ماه انتخابی: ${Math.abs(
              investorProfitOrLoss
            ).toLocaleString()} تومان ${investorProfitOrLoss >= 0 ? "(سود)" : "(زیان)"}`}
            color={investorProfitOrLoss >= 0 ? "success" : "error"}
            sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
          />

          {/* 🟣 بازده سرمایه‌گذاری نسبت به مبلغ شما */}
          <Chip
            label={`بازده سرمایه‌گذاری شما: ${
              investorReturnPercentage >= 0
                ? `${investorReturnPercentage.toFixed(2)}٪ سود نسبت به مبلغ سرمایه‌گذاری`
                : `${Math.abs(investorReturnPercentage).toFixed(2)}٪ زیان نسبت به مبلغ سرمایه‌گذاری`
            }`}
            color={investorReturnPercentage >= 0 ? "secondary" : "error"}
            sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
          />


        </Box>




          <Divider sx={{ my: 3 }} />

          {/* محصولات */}
          {workshop.products?.length > 0 && (
            <>
              <Typography variant="h5">📦 تولید محصولات ماهانه</Typography>
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
                      {p.name} - تعداد: {monthlyVolume} قطعه
                    </Typography>
                    <Box sx={{ width: 600, height: 70 }}>
                      <Bar data={barData} options={barOptions} />
                    </Box>
                  </Box>
                );
              })}
            </>
          )}


          {/* 👤 بخش نیروی انسانی و مدیرعامل - نهایی و راست‌چین کامل */}
          <Grid
            container
            spacing={3}
            alignItems="flex-start"
            justifyContent="flex-end" // 👈 کل کارت‌ها از راست شروع کن
            sx={{
              mt: 2, // کمتر از قبل تا بالا بیاد
              direction: "rtl",
              textAlign: "right",
            }}
          >
            {/* مدیرعامل */}
            {workshop.manager && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                    backgroundColor: "#fff",
                    textAlign: "right",
                    height: "100%",
                    mb: 0, // 👈 حذف فاصله‌ی زیر کارت
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      mt: 0, // 👈 حذف فاصله‌ی اضافی بالا
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      fontWeight: 600,
                    }}
                  >
                    <AccountCircleIcon sx={{ ml: 1, color: "primary.main" }} />
                    مدیرعامل
                  </Typography>

                  <Typography
                    sx={{
                      lineHeight: 1.8,
                      fontSize: "0.95rem",
                      textAlign: "right",
                      m: 0,
                    }}
                  >
                    <strong>{workshop.manager.name}</strong> – {workshop.manager.description}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* نیروی انسانی */}
            {workshop.team_categories?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                    backgroundColor: "#fff",
                    textAlign: "right",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      mt: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      fontWeight: 600,
                    }}
                  >
                    <PeopleIcon sx={{ ml: 1, color: "primary.main" }} />
                    نیروی انسانی
                  </Typography>

                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      lineHeight: 1.9,
                      textAlign: "right",
                    }}
                  >
                    {workshop.team_categories.map((t, i) => (
                      <li key={i}>
                        {t.category_name}: <strong>{t.count}</strong> نفر
                      </li>
                    ))}
                  </ul>
                </Box>
              </Grid>
            )}
          </Grid>



          {/* گزارش‌ها نسخه جدید */}
          {workshop.monthly_reports?.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />

              {/* 📊 جفت نمودارها کنار هم */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  width: "100%",
                  direction: "rtl",
                  gap: 6,
                }}
              >
                {/* 📆 نمودار سالانه */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "49%" },
                    height: 380,
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    boxShadow: 3,
                    p: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", mb: 1 }}>
                    <BarChartIcon sx={{ color: "primary.main", ml: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      نمودار سالانه
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 1.5,
                      mb: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      style={{
                        fontSize: "1rem",
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                      }}
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      style={{
                        fontSize: "1rem",
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="sales">فروش</option>
                      <option value="profit">سود</option>
                      <option value="profit_percentage">درصد سود</option>
                      <option value="production_amount">تعداد تولید</option>
                      <option value="fixed_workshop_rent">اجاره زمین/ساخت</option>
                      <option value="equipment_rent">اجاره تجهیزات</option>
                      <option value="material_costs">مواد اولیه</option>
                      <option value="salary_maintenance">حقوق و تعمیرات</option>
                      <option value="total_monthly_value">ارزش کل ماهانه</option>
                    </select>
                  </Box>

                  <Box sx={{ width: "100%", flexGrow: 1, height: 320 }}>
                    <Bar
                      data={{
                        labels: fullYearData.map(r => r.monthName),
                        datasets: [
                          {
                            label:
                              selectedMetric === "sales"
                                ? "فروش سالانه"
                                : selectedMetric === "profit"
                                ? "سود سالانه"
                                : selectedMetric === "profit_percentage"
                                ? "درصد سود"
                                : "شاخص مالی سالانه",
                            data: fullYearData.map(r => r[selectedMetric] || 0),
                            backgroundColor:
                              selectedMetric === "sales" ? "#42A5F5" : // فروش
                              selectedMetric === "profit" ? "#4CAF50" : // سود
                              selectedMetric === "profit_percentage" ? "#81D4FA" : // درصد سود
                              selectedMetric === "fixed_workshop_rent" ? "#81D4FA" : // اجاره زمین/ساخت
                              selectedMetric === "equipment_rent" ? "#9575CD" : // اجاره تجهیزات
                              selectedMetric === "material_costs" ? "#FFB74D" : // مواد اولیه
                              selectedMetric === "salary_maintenance" ? "#E57373" : // حقوق و تعمیرات
                              selectedMetric === "total_monthly_value" ? "#BA68C8" : // ارزش کل ماهانه
                              "#dfd248ff", // خاکستری پیش‌فرض


                            borderRadius: 6,
                            barThickness: 30,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: { position: "bottom" },
                          tooltip: {
                            callbacks: {
                              label: (ctx) =>
                                `${ctx.dataset.label}: ${ctx.formattedValue.toLocaleString(
                                  "fa-IR"
                                )} تومان`,
                            },
                          },
                        },
                        scales: {
                          x: {
                            ticks: { font: { size: 13 } },
                          },
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (val) =>
                                val >= 1_000_000
                                  ? `${(val / 1_000_000).toFixed(1)} م`
                                  : val.toLocaleString("fa-IR"),
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>


                {/* 📅 نمودار ماهانه */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "49%" },
                    height: 380,
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    boxShadow: 3,
                    p: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", mb: 1 }}>
                    <InsertChartIcon sx={{ color: "secondary.main", ml: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      نمودار ماهانه
                    </Typography>
                  </Box>


                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 1.5,
                      mb: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setSelectedMonth("");
                      }}
                      style={{
                        fontSize: "1rem",
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                      }}
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      disabled={!selectedYear}
                      style={{
                        fontSize: "1rem",
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                      }}
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {monthNames[m - 1] || m}
                        </option>
                      ))}
                    </select>

                    {/* نمایش درصد سود یا زیان در یک خط */}
                    {monthDetail && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          ml: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* درصد سود یا زیان */}
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: monthDetail.profit_percentage >= 0 ? "green" : "red",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monthDetail.profit_percentage >= 0
                            ? `${(monthDetail.profit_percentage * 100).toFixed(1)}٪ سود`
                            : `${Math.abs(monthDetail.profit_percentage * 100).toFixed(1)}٪ زیان`}
                        </Typography>

                        {/* 🔹 نمایش تعداد تولید به‌صورت باکس رنگی (Badge) */}
                        {monthDetail.production_amount !== undefined && (
                          <Box
                            sx={{
                              backgroundColor: "#eee",
                              borderRadius: "8px",
                              px: 1.5,
                              py: 0.3,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              color: "#333",
                            }}
                          >
                            {`تعداد تولید: ${monthDetail.production_amount.toLocaleString()} عدد`}
                          </Box>
                        )}
                      </Box>
                    )}

                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: 1.5,
                      height: 320, // ارتفاع کمی بیشتر برای نمایش کامل 7 ستون
                    }}
                    >
                    {/* 💰نمودار مالی کامل */}
                    <Box sx={{ width: "100%", flexGrow: 1 }}>
                      <Bar
                        data={{
                          labels: [
                            "فروش",
                            "سود",
                            "اجاره زمین و ساخت",
                            "اجاره تجهیزات",
                            "مواد اولیه",
                            "حقوق و نگهداری",
                            "ارزش کل ماهانه",
                          ],
                          datasets: [
                            {
                              label: "عملکرد مالی ماهانه",
                              data: [
                                monthDetail?.sales || 0,
                                monthDetail?.profit || 0,
                                monthDetail?.fixed_workshop_rent || 0,
                                monthDetail?.equipment_rent || 0,
                                monthDetail?.material_costs || 0,
                                monthDetail?.salary_maintenance || 0,
                                monthDetail?.total_monthly_value || 0,
                              ],
                              backgroundColor: [
                                "#42a5f5", // فروش - آبی
                                "#4caf50", // سود خالص - سبز
                                "#81d4fa", // اجاره زمین
                                "#9575cd", // اجاره تجهیزات
                                "#ffb74d", // مواد اولیه
                                "#e57373", // حقوق و نگهداری
                                "#ba68c8", // ارزش کل
                              ],
                              borderRadius: 6,
                              barThickness: 30,
                            },
                          ],
                        }}
                        options={{
                          maintainAspectRatio: false,
                          responsive: true,
                          plugins: {
                            legend: { position: "bottom" },
                            tooltip: {
                              callbacks: {
                                label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} تومان`,
                              },
                            },
                          },
                          scales: {
                            x: {
                              ticks: { font: { size: 13 } },
                            },
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: (val) =>
                                  val >= 1_000_000
                                    ? `${(val / 1_000_000).toFixed(1)} م` // نمایش میلیون
                                    : val.toLocaleString("fa-IR"),
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}

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
