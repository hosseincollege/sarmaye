import React from "react";
import { Button, Typography, Box, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InsightsIcon from "@mui/icons-material/Insights";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupsIcon from "@mui/icons-material/Groups";
import SecurityIcon from "@mui/icons-material/Security";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <InsightsIcon fontSize="large" color="primary" />,
      title: "اطلاعات شفاف",
      desc: "گزارش‌های تولید، فروش، شاخص‌های عملکرد و اسناد مالی کامل در اختیار شماست."
    },
    {
      icon: <BarChartIcon fontSize="large" color="primary" />,
      title: "نمودارهای عملکرد",
      desc: "داده‌ها در قالب نمودار و گراف‌های قابل فهم نمایش داده می‌شوند."
    },
    {
      icon: <GroupsIcon fontSize="large" color="primary" />,
      title: "تصمیم‌گیری جمعی",
      desc: "کاربران نظر می‌دهند و بر اساس اکثریت رأی، مسیر سرمایه‌گذاری مشخص می‌شود."
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: "امنیت و اعتبار",
      desc: "اطلاعات و سوابق کارگاه‌ها بررسی و تأیید می‌شوند تا اعتماد شما جلب شود."
    }
  ];

  return (
    <Box sx={{ p: 4, textAlign: "center", maxWidth: "1100px", margin: "auto" }}>
      {/* عنوان صفحه */}
      <Typography variant="h4" gutterBottom>
        به سیمین پلاس خوش آمدید — مرکز سرمایه‌گذاری شفاف در تولید
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        اینجا می‌توانید کارگاه‌ها را با کامل‌ترین داده‌ها بررسی کنید، از گزارش‌های فروش تا نمودارهای عملکرد،
        و در نهایت بر اساس نظر جمعی سرمایه‌گذاری کنید.
      </Typography>

      {/* دکمه CTA */}
      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 4 }}
        onClick={() => navigate("/workshops")}
      >
        مشاهده کارگاه‌ها
      </Button>
      
      {/* مستطیل چهارقسمتی */}
      <Paper
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: "#f9f9f9",
          direction: "rtl",
          borderRadius: 3
        }}
      >
        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {feature.icon}
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {feature.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {feature.desc}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
