import { useState } from "react";
import axios from "axios";

import {
  TextField, Button, Paper, Typography, Box, Grid, Divider, IconButton,
  Accordion, AccordionSummary, AccordionDetails, Chip, InputAdornment,
  Select, MenuItem, InputLabel, FormControl, Container, List, ListItem
} from "@mui/material";

import {
  AddCircle, RemoveCircle, ExpandMore, Category, Groups, Person,
  MonetizationOn, Assessment, Event, Inventory, Business, Image
} from "@mui/icons-material";



import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";


function formatNumber(value) {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const adornmentStyle = { fontSize: "0.8rem", color: "#555" };

const rtlInput = { "& input": { direction: "rtl", textAlign: "right" } };



export default function CreateWorkshop({ onCreated }) {

  // فهرست فیلدهایی که نیاز به قالب‌بندی عددی دارن
  const numericFields = [
    "monthly_rent",
    "equipment_rent",
    "material_costs",
    "salary_maintenance",
    "total_monthly_value",
    "area",
    "required_capital",
    "total_members",
  ];

  // هزینه‌های ماهانه پایه
  const [monthlyCosts, setMonthlyCosts] = useState({
    rent: "",            // اجاره زمین/سالن
  });


  // 📋 وضعیت فرم ایجاد کارگاه جدید (نسخه اصلاح‌شده)
  const [form, setForm] = useState({
    // === اطلاعات کلی ===
    title: "",                 // عنوان کارگاه
    description: "",           // توضیحات کارگاه
    product_type: "",          // نوع محصول

    // === اطلاعات تکمیلی ===
    category: "",              // دسته‌بندی (صنعتی، کشاورزی، پزشکی و ...)
    province: "",              // استان
    contact_number: "",        // شماره تماس
    website: "",               // وبسایت
    email: "",                 // ایمیل
    total_members: "",         // تعداد نیروها
    area: "",                  // مساحت سالن یا کارگاه
    required_capital: "",      // سرمایه مورد نیاز
    ownership_type: "",        // نوع مالکیت

    // === سایر اطلاعات زیرمجموعه ===
    location: "",              // موقعیت مکانی
    sales_representative: "",  // نمایندگی فروش اختصاصی
  });


  
  // ✅✅✅ این خط را اضافه کنید ✅✅✅
  const [selectedDate, setSelectedDate] = useState(null);

  const [products, setProducts] = useState([
    { name: "", monthly_volume: "", customers: [{ name: "", monthly_order_volume: "" }] }
  ]);

  const [teamCategories, setTeamCategories] = useState([{ category_name: "", count: "" }]);
  const [manager, setManager] = useState({ name: "", description: "" });

  const [investments, setInvestments] = useState([
    { amount: "", purpose: "" }
  ]);

  const monthNames = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];

  const thStyle = { border: "1px solid #ccc", padding: "8px" };
  const tdStyle = { border: "1px solid #ccc", padding: "6px" };
  const inputStyle = { 
    width: "120px", // عرض بزرگتر
    padding: "6px", 
    textAlign: "center",
    minWidth: "160px"
  };


  const createEmptyYearData = () =>
    Array.from({ length: 12 }, () => ({
      sales: "",
      production_amount: "",
      equipment_rent: "",          // مبلغ فرضی اجاره تجهیزات و ماشین‌آلات
      material_costs: "",          // هزینه خرید مواد اولیه
      salary_maintenance: "",      // حقوق نیروها / نگهداری / تعمیرات
      total_monthly_value: "",
      profit: "",
      profit_percentage: 0,
    }));



  const [copyMode, setCopyMode] = useState(false);
  const [monthlyReportsGroups, setMonthlyReportsGroups] = useState([
    { year: 1404, data: createEmptyYearData() }
  ]);

  function handleYearChange(groupIndex, newYear) {
    const copy = [...monthlyReportsGroups];
    copy[groupIndex].year = newYear;
    setMonthlyReportsGroups(copy);
  }

  function handleCellChange(groupIndex, monthIndex, field, value) {
    const updated = [...monthlyReportsGroups];
    updated[groupIndex].data[monthIndex][field] = value;
    
    // ✅ این خط کلیدی اضافه شد
    // بعد از تغییر مقدار سلول، محاسبات را برای همان ردیف دوباره انجام بده
    recalculateTotals(groupIndex, monthIndex); 

    // توجه: تابع recalculateTotals خودش در انتها setMonthlyReportsGroups را صدا می‌زند
    // پس نیازی به فراخوانی مجدد آن در اینجا نیست.
  }


  function handleAddNewYearTable() {
    setMonthlyReportsGroups([
      ...monthlyReportsGroups,
      { year: 1400, data: createEmptyYearData() }
    ]);
  }


  function handleRemoveYearTable(index) {
    const updated = monthlyReportsGroups.filter((_, i) => i !== index);
    setMonthlyReportsGroups(updated);
  }

  function handlePaste(groupIndex, startRow, e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const rows = text.trim().split("\n").map(r => r.split("\t"));
    const updated = [...monthlyReportsGroups];

    rows.forEach((rowData, rowOffset) => {
      const rowIndex = startRow + rowOffset;
      if (rowIndex < 12) {
        // ستون‌ها: [فروش, تولید, اجاره ثابت, اجاره تجهیزات, مواد اولیه, حقوق]
        const salesVal = rowData[0]?.trim() ?? "";
        const prodVal = rowData[1]?.trim() ?? "";
        const fixedRentVal = rowData[2]?.trim() ?? "";
        const equipRentVal = rowData[3]?.trim() ?? "";
        const matVal = rowData[4]?.trim() ?? "";
        const salaryVal = rowData[5]?.trim() ?? "";

        updated[groupIndex].data[rowIndex].sales = salesVal;
        updated[groupIndex].data[rowIndex].production_amount = prodVal;
        updated[groupIndex].data[rowIndex].equipment_rent = equipRentVal;
        updated[groupIndex].data[rowIndex].material_costs = matVal;
        updated[groupIndex].data[rowIndex].salary_maintenance = salaryVal;

        // اجاره ثابت رو جدا ذخیره کن (هر بار میخونه ولی برای کل سال یکیه)
        if (fixedRentVal) {
          updated[groupIndex].fixed_workshop_rent = Number(fixedRentVal) || 0;
        }

        recalculateTotals(groupIndex, rowIndex);
      }
    });

    setMonthlyReportsGroups(updated);
  }


  // ✅ تابع تغییر اجاره ثابت کارگاه
  function handleFixedRentChange(gIdx, value) {
    const updated = [...monthlyReportsGroups];
    updated[gIdx].fixed_workshop_rent = Number(value) || 0;
    setMonthlyReportsGroups(updated);

    // بعد از تغییر اجاره ثابت همه ماه‌ها رو دوباره حساب کن
    updated[gIdx].data.forEach((_, i) => recalculateTotals(gIdx, i));
  }

  // ✅ تابع محاسبه ارزش کل و سود
  function recalculateTotals(gIdx, i) {
    const updated = [...monthlyReportsGroups];
    const group = updated[gIdx];
    const row = group.data[i];

    const rentFixed = Number(group.fixed_workshop_rent || 0);
    const rentEquip = Number(row.equipment_rent || 0);
    const mat = Number(row.material_costs || 0);
    const salary = Number(row.salary_maintenance || 0);
    const sales = Number(row.sales || 0);

    // 💰 ارزش کل کارگاه = اجاره ثابت + اجاره تجهیزات + مواد اولیه + حقوق و نگهداری
    const total = rentFixed + rentEquip + mat + salary;
    row.total_monthly_value = total;

    // 💵 سود = فروش - ارزش کل کارگاه
    const profit = sales - total; 
    row.profit = profit;

    // 📊 محاسبه درصد سود (سود تقسیم بر فروش)
    // برای جلوگیری از تقسیم بر صفر، ابتدا فروش را بررسی می‌کنیم
    const percentage = sales > 0 ? profit / sales : 0;
    row.profit_percentage = percentage;

    setMonthlyReportsGroups(updated);
  }


  function exportToCSV() {
    const rows = [];

    monthlyReportsGroups.forEach((group) => {
      group.data.forEach((row, i) => {
        const rentFixed = Number(group.fixed_workshop_rent || 0);
        const equip = Number(row.equipment_rent || 0);
        const mat = Number(row.material_costs || 0);
        const salary = Number(row.salary_maintenance || 0);
        const sales = Number(row.sales || 0);

        // فقط فیلدهای ورودی، بدون سود و ارزش کل
        rows.push([
          group.year,
          monthNames[i],
          sales,
          row.production_amount || 0,
          rentFixed,
          equip,
          mat,
          salary,
        ]);
      });
    });

    const csvHeader = [
      "سال",
      "ماه",
      "فروش",
      "تعداد تولید",
      "اجاره ثابت",
      "اجاره تجهیزات",
      "مواد اولیه",
      "حقوق و نگهداری",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [csvHeader.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "monthly_reports.csv");
    document.body.appendChild(link);
    link.click();
  }



  // ✅ بارگذاری داده‌ها از CSV و پر کردن جدول
  function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result.trim().replace(/\r/g, "");
      const lines = text.split("\n").slice(1);
      if (!lines.length) {
        alert("⚠️ فایل CSV خالی است");
        return;
      }

      const groups = [];

      lines.forEach((line) => {
        const [
          yearStr,
          monthName,
          salesStr,
          productionStr,
          rentFixedStr,
          equipmentStr,
          materialStr,
          salaryStr,
        ] = line.split(",").map((x) => x?.trim());

        const year = Number(yearStr);
        if (!year || !monthName) return;

        // ایجاد یا پیدا کردن گروه سال
        let gIndex = groups.findIndex((g) => g.year === year);
        if (gIndex === -1) {
          groups.push({
            year: year,
            fixed_workshop_rent: Number(rentFixedStr) || 0,
            data: createEmptyYearData(),
          });
          gIndex = groups.length - 1;
        }

        const monthIdx = monthNames.indexOf(monthName);
        if (monthIdx >= 0 && groups[gIndex].data[monthIdx]) {
          groups[gIndex].data[monthIdx].sales = Number(salesStr) || 0;
          groups[gIndex].data[monthIdx].production_amount = Number(productionStr) || 0;
          groups[gIndex].data[monthIdx].equipment_rent = Number(equipmentStr) || 0;
          groups[gIndex].data[monthIdx].material_costs = Number(materialStr) || 0;
          groups[gIndex].data[monthIdx].salary_maintenance = Number(salaryStr) || 0;
        }
      });

      // --- شروع تغییرات ---
      // 💡 راه‌حل: محاسبات را مستقیماً روی آرایه groups قبل از set state انجام می‌دهیم
      groups.forEach((group) => {
        group.data.forEach((row) => {
          const rentFixed = Number(group.fixed_workshop_rent || 0);
          const rentEquip = Number(row.equipment_rent || 0);
          const mat = Number(row.material_costs || 0);
          const salary = Number(row.salary_maintenance || 0);
          const sales = Number(row.sales || 0);
          
          // 💰 ارزش کل کارگاه
          const total = rentFixed + rentEquip + mat + salary;
          row.total_monthly_value = total;

          // 💵 سود
          const profit = sales - total; // <-- سود را در متغیر محلی بریزید
          row.profit = profit;

          // 📊 درصد سود (این بخش اضافه شد)
          const percentage = sales > 0 ? profit / sales : 0;
          row.profit_percentage = percentage;
        });
      });
      
      // ست نهایی در state اصلی با داده‌های کامل و محاسبه‌شده
      setMonthlyReportsGroups(groups);
      // --- پایان تغییرات ---

      alert("✅ فایل CSV با موفقیت بارگذاری شد.");
    };

    reader.readAsText(file, "UTF-8");
  }




  const [coverImage, setCoverImage] = useState(null);
  const [gallery, setGallery] = useState([]);



  const handleChange = (e) => {
    const { name, value } = e.target;

    

    let newValue = value;

    if (numericFields.includes(name)) {
      const raw = value.replace(/[^\d]/g, ""); // حذف هر چیزی جز رقم
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      newValue = formatted;
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: newValue };

      // جمع کل فقط وقتی لازم انجام بشه
      if (
        ["monthly_rent", "equipment_rent", "material_costs", "salary_maintenance"].includes(name)
      ) {
        const total =
          (Number(updated.monthly_rent?.replace(/,/g, "") || 0)) +
          (Number(updated.equipment_rent?.replace(/,/g, "") || 0)) +
          (Number(updated.material_costs?.replace(/,/g, "") || 0)) +
          (Number(updated.salary_maintenance?.replace(/,/g, "") || 0));

        updated.total_monthly_value = total
          ? total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : "";
      }

      return updated;
    });
  };





  const handleDynamicChange = (state, setState, idx, key, value) => {
    const copy = [...state];
    copy[idx][key] = value;
    setState(copy);
  };

  const addItem = (state, setState, item) => setState([...state, item]);
  const removeItem = (state, setState, idx) =>
    setState(state.filter((_, i) => i !== idx));


  // 💡 تابع محاسبه تعداد کل نیروها (جمع تیم + مدیرعامل)
  function calcTeamTotal() {
    // مجموع اعضای هر دسته تیم (عدد داخل state: teamCategories)
    const teamCount = teamCategories.reduce((sum, c) => {
      const count = parseInt(c.count) || 0;
      return sum + count;
    }, 0);

    // یک نفر هم برای مدیرعامل حساب می‌شود
    return teamCount + (manager.name ? 1 : 0);
  }

  // 💰 تابع محاسبه کل سرمایه مورد نیاز (جمع مبالغ بخش‌های سرمایه‌گذاری)
  function calcTotalInvestment() {
    const total = investments.reduce((sum, inv) => {
      const amount = parseInt(inv.amount.toString().replace(/[^\d]/g, "")) || 0;
      return sum + amount;
    }, 0);
    // قالب‌بندی سه‌رقمی با "تومان"
    return total > 0 ? `${total.toLocaleString("fa-IR")} تومان` : "";
  }

  // --- توابع کمکی برای مدیریت لیست‌های داینامیک ---

  // ۱. توابع مربوط به محصولات (Products)
  const addProduct = () => addItem(
    products, 
    setProducts, 
    { name: "", monthly_volume: "", customers: [{ name: "", monthly_order_volume: "" }] }
  );
  const removeProduct = (idx) => removeItem(products, setProducts, idx);

  // ۲. توابع مربوط به دسته‌بندی تیم (Team Categories)
  const addTeamCategory = () => addItem(
    teamCategories, 
    setTeamCategories, 
    { category_name: "", count: "" }
  );
  const removeTeamCategory = (idx) => removeItem(teamCategories, setTeamCategories, idx);

  // ۳. توابع مربوط به سرمایه‌گذاری (Investments)
  const addInvestment = () => addItem(
    investments, 
    setInvestments, 
    { amount: "", purpose: "" }
  );
  const removeInvestment = (idx) => removeItem(investments, setInvestments, idx);


  // ✅ افزودن یک سال جدید با ۱۲ ماه خالی
  const addYearReports = () => {
    const currentYear =
      monthlyReportsGroups.length > 0
        ? monthlyReportsGroups[monthlyReportsGroups.length - 1].year + 1
        : new Date().getFullYear();

    const newYearData = {
      year: currentYear,
      fixed_workshop_rent: 0, // یا هر مقدار پیش‌فرض
      data: createEmptyYearData(),
    };

    setMonthlyReportsGroups([...monthlyReportsGroups, newYearData]);
  };

  // ✅ حذف یک سال خاص
  const removeYearReports = (index) => {
    const updatedGroups = monthlyReportsGroups.filter((_, i) => i !== index);
    setMonthlyReportsGroups(updatedGroups);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();


    const cleanedForm = { ...form };
    numericFields.forEach((field) => {
      if (cleanedForm[field]) {
        cleanedForm[field] = cleanedForm[field].toString().replace(/[^\d]/g, "");
      }
    });

    // ✅ 2. ساخت FormData با فرم پاک‌شده
    const fd = new FormData();

    // --- پایه کارگاه ---
    Object.entries(cleanedForm).forEach(([k, v]) => {
      if (v !== "" && k !== "start_date") {
        fd.append(k, v);
      }
    });

    // --- تاریخ به فرمت میلادی ---
    if (selectedDate) {
      const formattedDate = selectedDate.convert("gregorian").format("YYYY-MM-DD");
      fd.append("start_date", formattedDate);
    }

    // --- بخش‌های مختلف ---
    fd.append("monthly_costs", JSON.stringify(monthlyCosts));
    fd.append("products_data", JSON.stringify(products));
    fd.append("team_categories_data", JSON.stringify(teamCategories));
    fd.append("manager_data", JSON.stringify(manager));
    fd.append("investments_data", JSON.stringify(investments));
    // --- بخش گزارش ماهانه جدید ---
    fd.append(
      "monthly_reports_data",
      JSON.stringify(
        monthlyReportsGroups.flatMap((g) =>
          g.data.map((row, i) => {
            const rentFixed = Number(g.fixed_workshop_rent || 0);
            const rentEquip = Number(row.equipment_rent || 0);
            const mat = Number(row.material_costs || 0);
            const salary = Number(row.salary_maintenance || 0);
            const sales = Number(row.sales || 0);

            // 💰 محاسبات فرانت
            const total = rentFixed + rentEquip + mat + salary; // ارزش کل کارگاه
            const profit = sales - total; // سود
            const percentage = sales > 0 ? profit / sales : 0; // درصد سود

            return {
              year: g.year,
              month: i + 1,
              sales: sales,
              production_amount: row.production_amount === "" ? 0 : Number(row.production_amount),

              fixed_workshop_rent: rentFixed,
              equipment_rent: rentEquip,
              material_costs: mat,
              salary_maintenance: salary,

              // 👇 داده‌های محاسبه‌شده فرانت
              total_monthly_value: total,
              profit: profit,
              profit_percentage: percentage,
            };
          })
        )
      )
    );



    // --- فایل‌ها ---
    if (coverImage) fd.append("cover_image", coverImage);
    gallery.forEach((file) => {
      if (file && typeof file === "object" && file.name) {
        fd.append("uploaded_images", file);
      }
    });

    // --- ارسال نهایی ---
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/workshops/`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      alert("✅ کارگاه با موفقیت ثبت شد");
      if (onCreated) onCreated();
    } catch (err) {
      console.error("❌ خطا در ثبت:", err.response?.data || err.message);
      alert("❌ خطا در ثبت کارگاه: " + JSON.stringify(err.response?.data || err.message));
    }
  }; // ✅ بستن تابع handleSubmit


  function exportEmptyFormJSON() {
    // ✅ این ساختار تضمین می‌کنه همه کلیدها حتی اگه تهی باشن، در فایل باشن
    const emptyForm = {
      title: form.title || "",
      description: form.description || "",
      product_type: form.product_type || "",
      category: form.category || "",
      province: form.province || "",
      ownership_type: form.ownership_type || "",
      contact_number: form.contact_number || "",
      website: form.website || "",
      email: form.email || "",
      location: form.location || "",
      sales_representative: form.sales_representative || "",
      area: form.area || "",
      required_capital: form.required_capital || "",
      total_members: form.total_members || "",

      // 👇 بخش‌های چندگانه
      products: products.length
        ? products
        : [{ name: "", monthly_volume: "", customers: [{ name: "", monthly_order_volume: "" }] }],

      team_categories: teamCategories.length
        ? teamCategories
        : [{ category_name: "", count: "" }],

      manager: manager.name || manager.description
        ? manager
        : { name: "", description: "" },

      investments: investments.length
        ? investments
        : [{ amount: "", purpose: "" }]
    };

    const jsonContent =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(emptyForm, null, 2));

    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", "empty_form.json");
    document.body.appendChild(link);
    link.click();
  }


  
  // ✅ وارد کردن فرم از JSON با پاک‌سازی فقط فیلدهای عددی فرم و زیرمجموعه‌ها
  function importFromJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (data) {
          // 🔧 تابع پاک‌کننده‌ی اعداد
          const cleanNumericString = (val) => {
            if (!val) return "";
            return val
              .toString()
              .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)) // تبدیل اعداد فارسی
              .replace(/[^\d]/g, ""); // حذف هرچیزی غیر از رقم
          };

          // 🧾 فقط فیلدهای عددی فرم اصلی
          const numericKeys = ["area", "required_capital", "total_members"];
          numericKeys.forEach((key) => {
            if (data[key]) data[key] = cleanNumericString(data[key]);
          });

          // 🏭 محصولات و مشتری‌ها
          if (data.products) {
            data.products.forEach((p) => {
              p.monthly_volume = cleanNumericString(p.monthly_volume);
              if (p.customers) {
                p.customers.forEach((c) => {
                  c.monthly_order_volume = cleanNumericString(c.monthly_order_volume);
                });
              }
            });
          }

          // 👥 نیروی انسانی
          if (data.team_categories) {
            data.team_categories.forEach((t) => {
              t.count = cleanNumericString(t.count);
            });
          }

          // 💰 سرمایه‌گذاری‌ها
          if (data.investments) {
            data.investments.forEach((i) => {
              i.amount = cleanNumericString(i.amount);
            });
          }

          // 📋 ثبت در state‌ها
          setForm((prev) => ({ ...prev, ...data }));
          if (data.products) setProducts(data.products);
          if (data.team_categories) setTeamCategories(data.team_categories);
          if (data.manager) setManager(data.manager);
          if (data.investments) setInvestments(data.investments);

          alert("✅ فرم با موفقیت پر شد.");
        }
      } catch (err) {
        alert("❌ خطا در خواندن فایل JSON");
      }
    };

    reader.readAsText(file);
  }


  return (
    <>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Paper
          sx={{
            direction: "rtl",
            textAlign: "right",
            p: 3,
            borderRadius: 2,
            background: "#f9f9f9",
          }}
          >
          <Typography variant="h6" gutterBottom>ایجاد کارگاه جدید</Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              direction: "rtl",      // اطمینان از جهت فرم
              textAlign: "right",
            }}
          >
        
            {/* === اطلاعات کلی === */}
            <Grid container spacing={3} disableEqualOverflow sx={{ mt: 2 }}>
              <Grid item sx={{ width: '30%' }}>
                <Typography>عنوان کارگاه:</Typography>
                <TextField fullWidth name="title" value={form.title} onChange={handleChange}
                  InputProps={{ sx: { direction: "rtl", textAlign: "right" } }}
                />
              </Grid>

              <Grid item sx={{ width: '60%' }}>
                <Typography>توضیحات:</Typography>
                <TextField fullWidth name="description" value={form.description} onChange={handleChange} multiline rows={3}
                  InputProps={{ sx: { direction: "rtl", textAlign: "right" } }}
                />

                <TextField
                    label="نوع محصول"
                    name="product_type"
                    value={form.product_type}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{ sx: { direction: "rtl", textAlign: "right" } }}
                  />
              </Grid>

              

            </Grid>

            <Divider sx={{ my: 2 }}>
                <Chip label="اطلاعات تکمیلی" />
            </Divider>


            <Box sx={{ direction: 'rtl', textAlign: 'right', px: 1 }}>
            {/* --- پنج ستون بالا مطابق دیتیل --- */}
            <Grid container spacing={1} sx={{ mt: 1, alignItems: 'flex-start' }}>
              
              {/* ستون ۱: دسته‌بندی / استان */}
              <Grid item xs={12} sm={6} md={2.25}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}>
                    <InputLabel>دسته‌بندی</InputLabel>
                    <Select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <MenuItem value="industrial">صنعتی</MenuItem>
                      <MenuItem value="medical">پزشکی</MenuItem>
                      <MenuItem value="agriculture">کشاورزی</MenuItem>
                      <MenuItem value="livestock">دامداری</MenuItem>
                      <MenuItem value="software">نرم‌افزار</MenuItem>
                      <MenuItem value="hardware">سخت‌افزار</MenuItem>
                      <MenuItem value="electronics">الکترونیک</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="استان"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}
                  />
                </Box>
              </Grid>

              {/* ستون ۲: نوع مالکیت / شماره تماس */}
              <Grid item xs={12} sm={6} md={2.25}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  
                  <TextField
                    size="small"
                    label="نوع مالکیت"
                    name="ownership_type"
                    value={form.ownership_type}
                    onChange={handleChange}
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}
                  />
                  
                  <TextField
                    size="small"
                    label="شماره تماس"
                    name="contact_number"
                    value={form.contact_number}
                    onChange={handleChange}
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}
                  />
                </Box>
              </Grid>

              {/* ستون ۳: وبسایت / ایمیل */}
              <Grid item xs={12} sm={6} md={2.25}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <TextField
                    size="small"
                    label="وبسایت"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}
                  />
                  <TextField
                    size="small"
                    label="ایمیل"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}
                  />
                </Box>
              </Grid>

              {/* ستون ۴: نیروها / مساحت کارگاه */}
              <Grid item xs={12} sm={6} md={2.25}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <TextField
                    size="small"
                    label="تعداد نیروها"
                    value={calcTeamTotal()}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <InputAdornment position="end">نفر</InputAdornment>,
                    }}
                    sx={{ width: 180, '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}
                  />



                  <TextField
                    size="small"
                    label="مساحت کارگاه/سالن"
                    name="area"
                    value={form.area ? form.area.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                    onChange={(e) => {
                      // حذف هر چیزی غیر از رقم
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      setForm(prev => ({ ...prev, area: raw }));
                    }}
                    InputProps={{
                      endAdornment: form.area ? (   // ← فقط وقتی عدد داره واحدو نشون بده
                        <InputAdornment position="end" sx={{ fontSize: '0.9rem' }}>
                          متر مربع
                        </InputAdornment>
                      ) : null,
                      sx: { '& input': { textAlign: 'center' } },
                    }}
                    sx={{ 
                      width: 180, 
                      '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } 
                    }}
                  />




                </Box>
              </Grid>

              {/* ستون ۵: سرمایه مورد نیاز / تاریخ تاسیس */}
              <Grid item xs={12} sm={6} md={2.25}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <TextField
                    size="small"
                    label="سرمایه مورد نیاز"
                    value={calcTotalInvestment()}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                    sx={{ width: "100%", '& .MuiInputBase-root': { height: 34, fontSize: '1rem' } }}
                  />

                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="تاریخ تأسیس"
                    style={{ width: '100%', height: '34px', fontSize: '1rem', boxSizing: 'border-box' }}
                    containerStyle={{ width: '100%' }}
                  />

                  
                </Box>
              </Grid>
            </Grid>
          





              {/* --- بخش پایین: موقعیت / سرمایه‌گذاری --- */}
              <Grid container spacing={1.5} sx={{ mt: 2 }}>
                {/* سمت راست */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <TextField
                      size="small"
                      label="موقعیت مکانی"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 1 }}
                      InputProps={{ sx: { '& input': { textAlign: 'right' } } }}
                    />
                    <TextField
                      size="small"
                      label="نمایندگی فروش اختصاصی"
                      name="sales_representative"
                      value={form.sales_representative}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ sx: { '& input': { textAlign: 'right' } } }}
                    />
                  </Paper>
                </Grid>

                {/* سمت چپ */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined"    sx={{ p: 1.5, width: '110%', maxWidth: '900px', mx: 'auto' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: '0.9rem' }}>
                      💰 بخش‌های سرمایه‌گذاری
                    </Typography>
                    {investments.map((inv, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        <TextField
                          size="small"
                          label="مبلغ"
                          value={inv.amount ? inv.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                          onChange={(e) => {
                            // فقط عددها رو نگه دار
                            const raw = e.target.value.replace(/[^\d]/g, "");
                            const updated = [...investments];
                            updated[i].amount = raw;
                            setInvestments(updated);
                          }}
                          InputProps={{
                            endAdornment: inv.amount ? (
                              <InputAdornment position="end" sx={{ fontSize: '0.9rem' }}>
                                تومان
                              </InputAdornment>
                            ) : null,
                            sx: { "& input": { textAlign: "left" } },
                          }}
                          sx={{
                            flex: 1.5,
                            "& .MuiInputBase-root": { height: 34, fontSize: "1rem" },
                          }}
                        />




                        <TextField
                          size="small"
                          label="هدف"
                          value={inv.purpose}
                          onChange={(e) => {
                            const updated = [...investments];
                            updated[i].purpose = e.target.value;
                            setInvestments(updated);
                          }}
                          sx={{ flex: 2 }}
                        />
                        <IconButton onClick={() => removeInvestment(i)}>
                          <RemoveCircle color="error" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button startIcon={<AddCircle />} onClick={addInvestment} sx={{ direction: 'rtl', mt: 0.5, fontSize: '0.8rem' }}>
                      افزودن مرحله سرمایه‌گذاری
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Box>




            
            <Divider sx={{ my: 3 }} />


            {/* === محصولات و مشتریان === */}
            <Typography variant="h6">📦 محصولات</Typography>

            {products.map((prod, i) => (
              <Box
                key={i}
                sx={{
                  border: "1px solid #ccc",
                  p: 2,
                  borderRadius: 2,
                  mb: 2,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                {/* ستون راست: اطلاعات محصول */}
                <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <TextField
                      label="نام محصول"
                      value={prod.name}
                      onChange={(e) => {
                        const newP = [...products];
                        newP[i].name = e.target.value;
                        setProducts(newP);
                      }}
                      sx={{ flex: 6 }} // ۶۰٪
                    />

                    <TextField
                      size="small"
                      label="حجم تولید ماهانه"
                      value={
                        prod.monthly_volume
                          ? prod.monthly_volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          : ""
                      }
                      onChange={(e) => {
                        // فقط عدد رو نگه می‌داریم
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        const updated = [...products];
                        updated[i].monthly_volume = raw;
                        setProducts(updated);
                      }}
                      InputProps={{
                        endAdornment: prod.monthly_volume ? (
                          <InputAdornment position="end" sx={{ fontSize: '0.9rem' }}>
                            عدد
                          </InputAdornment>
                        ) : null,
                        sx: { "& input": { textAlign: "left" } },
                      }}
                      sx={{
                        flex: 4, // نسبت به نام محصول ۴۰٪
                        "& .MuiInputBase-root": { height: 34, fontSize: "1rem" },
                      }}
                    />

                  </Box>

                  <IconButton onClick={() => removeProduct(i)}>
                    <RemoveCircle color="error" />
                  </IconButton>
                </Box>

                {/* ستون چپ: مشتری‌ها */}
                <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                  {prod.customers.map((cust, ci) => (
                    <Box key={ci} sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <TextField
                        label="نام مشتری"
                        value={cust.name}
                        onChange={(e) => {
                          const newP = [...products];
                          newP[i].customers[ci].name = e.target.value;
                          setProducts(newP);
                        }}
                        sx={{ flex: 6 }}
                      />
                      <TextField
                        size="small"
                        label="حجم سفارش ماهانه"
                        value={
                          cust.monthly_order_volume
                            ? cust.monthly_order_volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          const updated = [...products];
                          updated[i].customers[ci].monthly_order_volume = raw;
                          setProducts(updated);
                        }}
                        InputProps={{
                          endAdornment: cust.monthly_order_volume ? (
                            <InputAdornment position="end" sx={{ fontSize: '0.9rem' }}>
                              عدد
                            </InputAdornment>
                          ) : null,
                          sx: { "& input": { textAlign: "left" } },
                        }}
                        sx={{
                          flex: 4,
                          "& .MuiInputBase-root": { height: 34, fontSize: "1rem" },
                        }}
                      />

                    </Box>
                  ))}

                  <Button
                    onClick={() => {
                      const newP = [...products];
                      newP[i].customers.push({ name: "", monthly_order_volume: "" });
                      setProducts(newP);
                    }}
                  >
                    ➕ افزودن مشتری
                  </Button>
                </Box>
              </Box>
            ))}

            <Button startIcon={<AddCircle />} onClick={addProduct}>
              افزودن محصول
            </Button>

            <Divider />

            {/* === نیروی انسانی === */}
            <Typography variant="h6">👥 نیروی انسانی</Typography>
            <Box sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3
            }}>
              {/* ستون راست: دسته‌ها و تعداد */}
              <Box sx={{ flex: 1 }}>
                {teamCategories.map((cat, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      label="دسته"
                      value={cat.category_name}
                      onChange={(e) => {
                        const newC = [...teamCategories];
                        newC[i].category_name = e.target.value;
                        setTeamCategories(newC);
                      }}
                      sx={{ flex: 6 }} // ۶۰٪
                    />
                    <TextField
                      size="small"
                      label="تعداد"
                      value={
                        cat.count
                          ? cat.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          : ""
                      }
                      onChange={(e) => {
                        // فقط رقم قبول کنه
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        const newC = [...teamCategories];
                        newC[i].count = raw;
                        setTeamCategories(newC);
                      }}
                      InputProps={{
                        endAdornment: cat.count ? (
                          <InputAdornment position="end" sx={{ fontSize: "0.9rem" }}>
                            نفر
                          </InputAdornment>
                        ) : null,
                        sx: { "& input": { textAlign: "left" } },
                      }}
                      sx={{
                        flex: 4, // ۴۰٪
                        "& .MuiInputBase-root": { height: 34, fontSize: "1rem" },
                      }}
                    />
                    <IconButton onClick={() => removeTeamCategory(i)}>
                      <RemoveCircle color="error" />
                    </IconButton>
                  </Box>
                ))}

                <Button startIcon={<AddCircle />} onClick={addTeamCategory}>
                  افزودن دسته تیم
                </Button>
              </Box>

              {/* ستون چپ: مدیرعامل */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1">مدیرعامل</Typography>
                <TextField
                  fullWidth
                  label="نام مدیر"
                  value={manager.name}
                  onChange={(e) => setManager({ ...manager, name: e.target.value })}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="توضیح کوتاه"
                  value={manager.description}
                  onChange={(e) => setManager({ ...manager, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Box>
            </Box>

            

            <Divider />

            <Typography variant="h6">📝 مدیریت فرم کامل</Typography>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <Button onClick={exportEmptyFormJSON}>دانلود فرم خام JSON</Button>
              <Button component="label">
                بارگذاری JSON
                <input type="file" accept=".json" hidden onChange={importFromJSON} />
              </Button>
            </div>



            <Divider />

            {/* === گزارش‌های ماهانه === */}
            <Typography variant="h6" gutterBottom>📊 گزارش‌های ماهانه</Typography>

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <Button onClick={() => setCopyMode(!copyMode)}>
                {copyMode ? "حالت ویرایش" : "حالت کپی"}
              </Button>
              <Button onClick={exportToCSV}>دانلود CSV</Button>
              <Button component="label">
                بارگذاری CSV
                <input type="file" accept=".csv" hidden onChange={importFromCSV} />
              </Button>
              <Button startIcon={<AddCircle />} onClick={handleAddNewYearTable}>
                افزودن سال جدید
              </Button>
            </div>


            {monthlyReportsGroups.map((group, gIdx) => (
              <div
                key={gIdx}
                style={{
                  marginBottom: "24px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#fff",
                  padding: "10px",
                }}
              >
                {/* انتخاب سال */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControl sx={{ minWidth: 120, mb: 2 }}>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>سال:</Typography>
                    <Select
                      value={group.year}
                      onChange={(e) => handleYearChange(gIdx, e.target.value)}
                    >
                      {Array.from({ length: 121 }, (_, idx) => {
                        const year = 1380 + idx;
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>

                  <IconButton color="error" onClick={() => handleRemoveYearTable(gIdx)}>
                    <RemoveCircle />
                  </IconButton>
                </div>

                {/* 🏭 هزینه ثابت اجاره سالن / کارگاه */}
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>هزینه ثابت اجاره کارگاه (ماهانه):</Typography>
                  <TextField
                    value={formatNumber(group.fixed_workshop_rent || 0)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      handleFixedRentChange(gIdx, raw);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={adornmentStyle}>
                          تومان
                        </InputAdornment>
                      ),
                      sx: { "& input": { textAlign: "center" } },
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ width: "200px" }}
                  />
                </Box>

                {/* جدول ماهانه */}
                <div style={{ overflowX: "auto", background: "#fff" }}>
                  <table
                    style={{
                      borderCollapse: "collapse",
                      minWidth: "1100px",
                      textAlign: "center",
                      width: "100%",
                      userSelect: copyMode ? "text" : "auto",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
                        <th style={thStyle}>ماه</th>
                        <th style={thStyle}>فروش</th>
                        <th style={thStyle}>تعداد تولید</th>
                        <th style={thStyle}>اجاره تجهیزات</th>
                        <th style={thStyle}>مواد اولیه</th>
                        <th style={thStyle}>حقوق و نگهداری</th>
                        <th style={thStyle}>ارزش کل کارگاه</th>
                        <th style={thStyle}>سود</th>
                        <th style={thStyle}>درصد سود</th>
                      </tr>
                    </thead>

                    <tbody>
                      {monthNames.map((month, i) => {
                        const monthTdStyle = {
                          ...tdStyle,
                          width: "90px",
                          minWidth: "90px",
                          background: "#f7f7f7",
                          fontWeight: "bold",
                        };

                        // فیلدهای قابل ویرایش
                        const fields = [
                          { key: "sales", unit: "تومان", width: 210 },
                          { key: "production_amount", unit: "عدد", width: 150 },
                          { key: "equipment_rent", unit: "تومان", width: 210 },
                          { key: "material_costs", unit: "تومان", width: 210 },
                          { key: "salary_maintenance", unit: "تومان", width: 210 },
                        ];

                        const valueStyle = {
                          ...tdStyle,
                          width: "140px",
                          fontWeight: "bold",
                          background: "#fafafa",
                        };

                        return (
                          <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                            <td style={monthTdStyle}>{month}</td>

                            {fields.map(({ key, unit, width }) => {
                              const displayValue = formatNumber(group.data[i][key]);
                              const specificTdStyle = {
                                ...tdStyle,
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                maxWidth: `${width}px`,
                              };

                              return (
                                <td style={specificTdStyle} key={key}>
                                  {copyMode ? (
                                    <span>{displayValue || 0} {group.data[i][key] && unit}</span>
                                  ) : (
                                    <TextField
                                      value={displayValue}
                                      onChange={(e) => {
                                        let raw = e.target.value.replace(/[^\d]/g, "");
                                        handleCellChange(gIdx, i, key, raw);
                                        recalculateTotals(gIdx, i); // 💡 هر بار بعد از تغییر فیلد، محاسبه مجدد
                                      }}
                                      onPaste={(e) => handlePaste(gIdx, i, e)}
                                      InputProps={{
                                        endAdornment: group.data[i][key] !== "" && (
                                          <InputAdornment position="end" sx={adornmentStyle}>
                                            {unit}
                                          </InputAdornment>
                                        ),
                                        sx: { "& input": { textAlign: "center" } },
                                      }}
                                      variant="standard"
                                      style={{ width: "100%" }}
                                    />
                                  )}
                                </td>
                              );
                            })}

                            {/* 🧾 ارزش کل کارگاه */}
                            <td style={valueStyle}>
                              {formatNumber(group.data[i].total_monthly_value || 0)} تومان
                            </td>

                            {/* 💵 سود */}
                            <td style={valueStyle}>
                              {formatNumber(group.data[i].profit || 0)} تومان
                            </td>

                            {/* 📊 درصد سود */}
                            <td
                              style={{
                                ...valueStyle,
                                color: (group.data[i].profit_percentage || 0) >= 0 ? "green" : "red",
                                whiteSpace: "nowrap", // برای جلوگیری از شکستن خط
                              }}
                            >
                              {
                                (() => {
                                  const percentage = group.data[i].profit_percentage || 0;
                                  if (percentage >= 0) {
                                    return `${(percentage * 100).toFixed(1)}٪ سود`;
                                  } else {
                                    return `${Math.abs(percentage * 100).toFixed(1)}٪ زیان`;
                                  }
                                })()
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}



            <Divider />

            {/* === کاور و گالری === */}
            <Typography>کاور:</Typography>
            <Button variant="outlined" component="label">انتخاب فایل
              <input type="file" hidden onChange={(e) => setCoverImage(e.target.files[0])} />
            </Button>
            {coverImage && <Typography variant="body2" color="textSecondary">📄 {coverImage.name}</Typography>}

            <Typography>تصاویر گالری:</Typography>
            <Button variant="outlined" component="label">انتخاب فایل‌ها
              <input type="file" hidden multiple onChange={(e) => setGallery([...e.target.files])} />
            </Button>
            {gallery.length > 0 && <ul>{gallery.map((f,i) => <li key={i}>📄 {f.name}</li>)}</ul>}

            <Button type="submit" variant="contained" color="primary">ایجاد کارگاه</Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}