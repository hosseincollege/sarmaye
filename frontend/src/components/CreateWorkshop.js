import { useState } from "react";
import axios from "axios";

import {
  TextField, Button, Paper, Typography, Box, Grid, Divider, IconButton,
  Accordion, AccordionSummary, AccordionDetails, Chip, InputAdornment,
  Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import {
  AddCircle, RemoveCircle, ExpandMore, Category, Groups, Person,
  MonetizationOn, Assessment, Event, Inventory, Business, Image
} from "@mui/icons-material";


import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";

function formatNumber(value) {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const adornmentStyle = { fontSize: "0.8rem", color: "#555" };

const rtlInput = { "& input": { direction: "rtl", textAlign: "right" } };


// ساخت تم راست‌چین
const theme = createTheme({
  direction: "rtl",
});

// ساخت کش RTL برای Emotion
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
});

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <div dir="rtl">
          <CreateWorkshop />
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}


export default function CreateWorkshop({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    last_year_sales: "",
    last_year_profit: "",

    // فیلدهای جدید اضافه شده
    contact_number: "",
    sales_representative: "",
    start_date: "",
    funded_percentage: "",
    address: "",
    agency: "",
    product_type: "",
    required_capital: "",
    profit_percentage: "",
    contract_duration: "",
    contract_details: "",
    website: "",
    email: ""
  });
  
  // ✅✅✅ این خط را اضافه کنید ✅✅✅
  const [selectedDate, setSelectedDate] = useState(null);

  const [products, setProducts] = useState([
    { name: "", monthly_volume: "", customers: [{ name: "", monthly_order_volume: "" }] }
  ]);

  const [teamCategories, setTeamCategories] = useState([{ category_name: "", count: "" }]);
  const [manager, setManager] = useState({ name: "", description: "" });

  const [investments, setInvestments] = useState([
    { amount: "", purpose: "", profit_percentage: "", return_duration_months: "" }
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
      sales: "", gross_profit: "", net_profit: "",
      profit_percentage: "", production_amount: "", sold_amount: ""
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
    const copy = [...monthlyReportsGroups];
    copy[groupIndex].data[monthIndex][field] = value;
    setMonthlyReportsGroups(copy);
  }

  function handleAddNewYearTable() {
    setMonthlyReportsGroups([
      ...monthlyReportsGroups,
      { year: 1400, data: createEmptyYearData() }
    ]);
  }

  function handleRemoveYearTable(groupIndex) {
    setMonthlyReportsGroups(monthlyReportsGroups.filter((_, i) => i !== groupIndex));
  }

  function handlePaste(groupIndex, startRow, e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const rows = text.trim().split("\n").map(r => r.split("\t"));
    const updated = [...monthlyReportsGroups];

    rows.forEach((rowData, rowOffset) => {
      const rowIndex = startRow + rowOffset;
      if (rowIndex < 12) {
        rowData.forEach((cell, colIndex) => {
          const fields = ["sales", "gross_profit", "net_profit", "profit_percentage", "production_amount", "sold_amount"];
          if (colIndex < fields.length) {
            updated[groupIndex].data[rowIndex][fields[colIndex]] = cell.trim();
          }
        });
      }
    });

    setMonthlyReportsGroups(updated);
  }

  function exportToCSV() {
    const rows = [];
    monthlyReportsGroups.forEach((group) => {
      group.data.forEach((row, i) => {
        rows.push([
          group.year, monthNames[i],
          row.sales || 0, row.gross_profit || 0, row.net_profit || 0,
          row.profit_percentage || 0, row.production_amount || 0, row.sold_amount || 0
        ]);
      });
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["سال,ماه,فروش,سود ناخالص,سود خالص,درصد سود,تولید,فروش رفته",
      ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "monthly_reports.csv");
    document.body.appendChild(link);
    link.click();
  }

  function importFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split("\n").slice(1);
      const groups = {};
      lines.forEach((line) => {
        if (!line.trim()) return;
        const [year, monthName, sales, gross_profit, net_profit,
          profit_percentage, production_amount, sold_amount] = line.split(",");
        const yearNum = parseInt(year);
        if (!groups[yearNum]) groups[yearNum] = createEmptyYearData();
        const monthIndex = monthNames.indexOf(monthName);
        if (monthIndex >= 0) {
          groups[yearNum][monthIndex] = {
            sales: sales || 0,
            gross_profit: gross_profit || 0,
            net_profit: net_profit || 0,
            profit_percentage: profit_percentage || 0,
            production_amount: production_amount || 0,
            sold_amount: sold_amount || 0
          };
        }
      });
      setMonthlyReportsGroups(
        Object.keys(groups).map((yr) => ({
          year: parseInt(yr), data: groups[yr]
        }))
      );
    };
    reader.readAsText(file);
  }


  const currentYear = new Date().getFullYear(); // سال جاری

  const [monthlyReports, setMonthlyReports] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: currentYear,
      sales: 0,
      gross_profit: 0,
      net_profit: 0,
      profit_percentage: 0,
      production_amount: 0,
      sold_amount: 0,
    }))
  );


  const [coverImage, setCoverImage] = useState(null);
  const [gallery, setGallery] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDynamicChange = (state, setState, idx, key, value) => {
    const copy = [...state];
    copy[idx][key] = value;
    setState(copy);
  };

  const addItem = (state, setState, item) => setState([...state, item]);
  const removeItem = (state, setState, idx) =>
    setState(state.filter((_, i) => i !== idx));


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
    { amount: "", purpose: "", profit_percentage: "", return_duration_months: "" }
  );
  const removeInvestment = (idx) => removeItem(investments, setInvestments, idx);

  // ۴. توابع مربوط به گزارشات ماهانه (Monthly Reports)
  const addMonthlyReport = () => addItem(
    monthlyReports, 
    setMonthlyReports, 
    { month: "", year: "", sales: "", gross_profit: "", net_profit: "", profit_percentage: "", production_amount: "", sold_amount: "" }
  );
  const removeMonthlyReport = (idx) => removeItem(monthlyReports, setMonthlyReports, idx);


  // افزودن ۱۲ ماه یک سال جدید
  const addYearReports = () => {
    if (monthlyReports.length === 0) {
      const currentYear = new Date().getFullYear();
      const newYearData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        year: currentYear,
        sales: "",
        gross_profit: "",
        net_profit: "",
        profit_percentage: "",
        production_amount: "",
        sold_amount: ""
      }));
      setMonthlyReports(newYearData);
    } else {
      const years = monthlyReports.map(r => Number(r.year) || new Date().getFullYear());
      const maxYear = Math.max(...years);
      const newYearData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        year: maxYear + 1,
        sales: "",
        gross_profit: "",
        net_profit: "",
        profit_percentage: "",
        production_amount: "",
        sold_amount: ""
      }));
      setMonthlyReports([...monthlyReports, ...newYearData]);
    }
  };

  // تابع handleSubmit و سایر توابع شما اینجا قرار می‌گیرند...

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    // ✅✅✅ این بلوک کد ویرایش شده است ✅✅✅
    // Workshop base
    Object.entries(form).forEach(([k, v]) => {
      // ⚠️ این شرط باعث می‌شود فیلد start_date از آبجکت form ارسال نشود
      if (v !== "" && k !== "start_date") { 
        fd.append(k, v);
      }
    });

    // ✅✅✅ این قسمت جدید اضافه شده است ✅✅✅
    // تاریخ را به صورت دستی و با فرمت صحیح اضافه می‌کنیم
    if (selectedDate) {
      const formattedDate = selectedDate.convert("gregorian").format("YYYY-MM-DD");
      fd.append("start_date", formattedDate);
    }

    // JSON data
    fd.append("products_data", JSON.stringify(products));
    fd.append("team_categories_data", JSON.stringify(teamCategories));
    fd.append("manager_data", JSON.stringify(manager));
    fd.append("investments_data", JSON.stringify(investments));
    fd.append("monthly_reports_data", JSON.stringify(
      monthlyReportsGroups.flatMap(g =>
        g.data.map((row, i) => ({
          year: g.year,
          month: i + 1,
          sales: row.sales === "" ? 0 : row.sales,
          gross_profit: row.gross_profit === "" ? 0 : row.gross_profit,
          net_profit: row.net_profit === "" ? 0 : row.net_profit,
          profit_percentage: row.profit_percentage === "" ? 0 : row.profit_percentage,
          production_amount: row.production_amount === "" ? 0 : row.production_amount,
          sold_amount: row.sold_amount === "" ? 0 : row.sold_amount
        }))
      )
    ));

    

    // --- 🖼️ ۶. فایل‌ها ---
    if (coverImage) fd.append("cover_image", coverImage); // کاور اصلی
    
    // تصاویر گالری

    gallery.forEach((file, index) => {
        if (file && typeof file === 'object' && file.name) {
            fd.append("uploaded_images", file);
            console.log(`Appending gallery image ${index}:`, file.name);
        }
    });

    // --- 🚀 ارسال به سرور ---
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
      alert("❌ خطا در ثبت کارگاه");
    }
  };


  function exportEmptyFormJSON() {
  const emptyForm = {
    ...form,
    products,
    teamCategories,
    manager,
    investments,
  };
  const jsonContent = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(emptyForm, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonContent);
  link.setAttribute("download", "empty_form.json");
  document.body.appendChild(link);
  link.click();
}


function importFromJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      
      if (data) {
        setForm(prev => ({ ...prev, ...data }));
        if (data.products) setProducts(data.products);
        if (data.teamCategories) setTeamCategories(data.teamCategories);
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
    <Paper sx={{ direction: "rtl", textAlign: "right", p: 3, borderRadius: 2, background: "#f9f9f9" }}>
      <Typography variant="h6" gutterBottom>ایجاد کارگاه جدید</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        
        {/* === اطلاعات کلی === */}
        <Typography>عنوان کارگاه:</Typography>
        <TextField name="title" value={form.title} onChange={handleChange} />

        <Typography>توضیحات:</Typography>
        <TextField name="description" value={form.description} onChange={handleChange} multiline rows={3} sx={rtlInput}/>


        <Divider sx={{ my: 2 }}>
            <Chip label="اطلاعات تکمیلی" />
        </Divider>

        <Grid item xs={12} sm={4}>
                <FormControl fullWidth sx={{ minWidth: 250 }}>
                  <Select
                    sx={{
                      width: "250px",
                      "& .MuiSelect-select": {
                        direction: "rtl",
                        textAlign: "right",
                      }
                    }}
                    value={form.category || ""}
                    name="category"
                    onChange={handleChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span style={{ color: "#888", fontSize: "16px" }}>دسته‌بندی را انتخاب کنید</span>;
                      }
                      const labels = {
                        industrial: "صنعتی",
                        medical: "پزشکی",
                        agriculture: "کشاورزی",
                        livestock: "دامداری",
                        software: "نرم‌افزار",
                        hardware: "سخت‌افزار",
                        electronics: "الکترونیک"
                      };
                      return labels[selected] || selected;
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          direction: "rtl",
                          textAlign: "right",
                        }
                      }
                    }}
                  >
                    <MenuItem value=""> </MenuItem>
                    <MenuItem value="industrial">صنعتی</MenuItem>
                    <MenuItem value="medical">پزشکی</MenuItem>
                    <MenuItem value="agriculture">کشاورزی</MenuItem>
                    <MenuItem value="livestock">دامداری</MenuItem>
                    <MenuItem value="software">نرم‌افزار</MenuItem>
                    <MenuItem value="hardware">سخت‌افزار</MenuItem>
                    <MenuItem value="electronics">الکترونیک</MenuItem>
                  </Select>
                </FormControl>
            </Grid>

        <Typography>استان:</Typography>
        <FormControl fullWidth>
          <Select
            value={form.address || ""}
            name="address"
            onChange={handleChange}
            displayEmpty
            renderValue={(selected) =>
              !selected ? <span style={{ color: "#888" }}>استان را انتخاب کنید</span> : selected
            }
            sx={{
              "& .MuiSelect-select": {
                direction: "rtl",
                textAlign: "right",
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  direction: "rtl",
                  textAlign: "right",
                }
              }
            }}
          >
            <MenuItem value=""><em>انتخاب کنید</em></MenuItem>
            <MenuItem value="تهران">تهران</MenuItem>
            <MenuItem value="اصفهان">اصفهان</MenuItem>
            <MenuItem value="شیراز">شیراز</MenuItem>
          </Select>
        </FormControl>

        <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="موقعیت مکانی"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    sx={rtlInput}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Business />
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>



        <Typography>نمایندگی فروش:</Typography>
        <TextField name="representative" value={form.sales_representative} onChange={handleChange} />

        
        <Typography>تاریخ تاسیس:</Typography>
        {/* ✅✅✅ این بلوک کد جایگزین شده است ✅✅✅ */}
        <DatePicker
            calendar={persian}
            locale={persian_fa}
            style={{
                direction: "rtl",
                width: "100%",
                padding: "10px",
                fontSize: "16px"
            }}
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="تاریخ تاسیس"
        />


        

        <Grid container spacing={2}>

            
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="نوع محصول/خدمات"
                    name="product_type"
                    value={form.product_type}
                    onChange={handleChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Category />
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>

            
        </Grid>

        <Divider sx={{ my: 2 }}>
            <Chip label="اطلاعات مالی و راه های ارتباطی" />
        </Divider>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="فروش سال گذشته (تومان)"
                    name="last_year_sales"
                    type="number"
                    value={form.last_year_sales}
                    onChange={handleChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MonetizationOn />
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="سود سال گذشته (تومان)"
                    name="last_year_profit"
                    type="number"
                    value={form.last_year_profit}
                    onChange={handleChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Assessment />
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
             <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="سرمایه مورد نیاز (تومان)"
                    name="required_capital"
                    type="number"
                    value={form.required_capital}
                    onChange={handleChange}
                />
            </Grid>
            <Typography>شماره تماس:</Typography>
            <TextField name="contact_number" value={form.contact_number} onChange={handleChange} />

            <Typography>وبسایت:</Typography>
            <TextField name="website" value={form.website} onChange={handleChange} />

            <Typography>ایمیل:</Typography>
            <TextField name="email" value={form.email} onChange={handleChange} />

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="درصد سود برای سرمایه‌گذار"
                    name="profit_percentage"
                    type="number"
                    value={form.profit_percentage}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="درصد پوشش سرمایه"
                    name="funded_percentage"
                    type="number"
                    value={form.funded_percentage}
                    onChange={handleChange}
                />
            </Grid>
             <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="مدت قرارداد (ماه)"
                    name="contract_duration"
                    type="number"
                    value={form.contract_duration}
                    onChange={handleChange}
                />
            </Grid>
             <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="شرکت/نمایندگی مرتبط"
                    name="agency"
                    value={form.agency}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="جزئیات تکمیلی قرارداد"
                    name="contract_details"
                    value={form.contract_details}
                    onChange={handleChange}
                    multiline
                    rows={3}
                />
            </Grid>
        </Grid>

        
        <Divider />

        {/* === محصولات و مشتریان === */}
        <Typography variant="h6">📦 محصولات</Typography>
        {products.map((prod, i) => (
          <Box key={i} sx={{ border: "1px solid #ccc", p: 2, borderRadius: 2, mb: 2 }}>
            <TextField fullWidth label="نام محصول" value={prod.name} onChange={(e) => {
              const newP = [...products];
              newP[i].name = e.target.value;
              setProducts(newP);
            }} />
            <TextField fullWidth label="حجم تولید ماهانه" value={prod.monthly_volume} onChange={(e) => {
              const newP = [...products];
              newP[i].monthly_volume = e.target.value;
              setProducts(newP);
            }} />
            {/* مشتری‌ها داخل هر محصول */}
            <Button onClick={() => {
              const newP = [...products];
              newP[i].customers.push({ name: "", monthly_order_volume: "" });
              setProducts(newP);
            }}>➕ افزودن مشتری</Button>
            {prod.customers.map((cust, ci) => (
              <Box key={ci} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField label="نام مشتری" value={cust.name} onChange={(e) => {
                  const newP = [...products];
                  newP[i].customers[ci].name = e.target.value;
                  setProducts(newP);
                }} />
                <TextField label="حجم سفارش ماهانه" value={cust.monthly_order_volume} onChange={(e) => {
                  const newP = [...products];
                  newP[i].customers[ci].monthly_order_volume = e.target.value;
                  setProducts(newP);
                }} />
              </Box>
            ))}
            <IconButton onClick={() => removeProduct(i)}><RemoveCircle color="error" /></IconButton>
          </Box>
        ))}
        <Button startIcon={<AddCircle />} onClick={addProduct}>افزودن محصول</Button>

        <Divider />

        {/* === تیم === */}
        <Typography variant="h6">👥 نیروی انسانی</Typography>
        {teamCategories.map((cat, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1 }}>
            <TextField label="دسته" value={cat.category_name} onChange={(e) => {
              const newC = [...teamCategories];
              newC[i].category_name = e.target.value;
              setTeamCategories(newC);
            }} />
            <TextField label="تعداد" value={cat.count} onChange={(e) => {
              const newC = [...teamCategories];
              newC[i].count = e.target.value;
              setTeamCategories(newC);
            }} />
            <IconButton onClick={() => removeTeamCategory(i)}><RemoveCircle color="error" /></IconButton>
          </Box>
        ))}
        <Button startIcon={<AddCircle />} onClick={addTeamCategory}>افزودن دسته تیم</Button>

        <Typography>مدیرعامل</Typography>
        <TextField label="نام مدیر" value={manager.name} onChange={(e) => setManager({...manager, name: e.target.value})} />
        <TextField label="توضیح کوتاه" value={manager.description} onChange={(e) => setManager({...manager, description: e.target.value})} />

        <Divider />

        {/* === سرمایه‌گذاری === */}
        <Typography variant="h6">💰 بخش‌های سرمایه‌گذاری</Typography>
        {investments.map((inv, i) => (
          <Box key={i} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <TextField label="مبلغ" value={inv.amount} onChange={(e) => {
              const newI = [...investments];
              newI[i].amount = e.target.value;
              setInvestments(newI);
            }} />
            <TextField label="هدف" value={inv.purpose} onChange={(e) => {
              const newI = [...investments];
              newI[i].purpose = e.target.value;
              setInvestments(newI);
            }} />
            <TextField label="درصد سود" value={inv.profit_percentage} onChange={(e) => {
              const newI = [...investments];
              newI[i].profit_percentage = e.target.value;
              setInvestments(newI);
            }} />
            <TextField label="مدت بازگشت (ماه)" value={inv.return_duration_months} onChange={(e) => {
              const newI = [...investments];
              newI[i].return_duration_months = e.target.value;
              setInvestments(newI);
            }} />
            <IconButton onClick={() => removeInvestment(i)}><RemoveCircle color="error" /></IconButton>
          </Box>
        ))}
        <Button startIcon={<AddCircle />} onClick={addInvestment}>افزودن مرحله سرمایه‌گذاری</Button>


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
              border: "1px solid #ddd", // رنگ روشن‌تر
              borderRadius: "8px",
              background: "#fff",
              padding: "10px"
            }}
          >

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
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <IconButton color="error" onClick={() => handleRemoveYearTable(gIdx)}>
                <RemoveCircle />
              </IconButton>
            </div>

            <div style={{ overflowX: "auto", background: "#fff" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  minWidth: "1000px",
                  textAlign: "center",
                  width: "100%",
                  userSelect: copyMode ? "text" : "auto"
                }}
              >
                <thead>
                  <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
                    <th style={thStyle}>ماه</th>
                    <th style={thStyle}>فروش</th>
                    <th style={thStyle}>سود ناخالص</th>
                    <th style={thStyle}>سود خالص</th>
                    <th style={thStyle}>درصد سود</th>
                    <th style={thStyle}>تعداد تولید شده</th>
                    <th style={thStyle}>تعداد فروش رفته</th>
                  </tr>
                </thead>
                <tbody>
                  {monthNames.map((month, i) => {
                    // <<< تغییر جدید: یک استایل مشخص برای سلول ماه تعریف می‌کنیم
                    const monthTdStyle = {
                      ...tdStyle,
                      width: "30px", // عرض دلخواه برای ستون ماه
                      minWidth: "30px",
                      maxWidth: "90px",
                      fontWeight: 'bold', // برای خوانایی بهتر
                      background: "#f7f7f7" // کمی رنگ متفاوت برای تمایز
                    };

                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                        {/* <<< تغییر جدید: از استایل بالا در اینجا استفاده می‌کنیم */}
                        <td style={monthTdStyle}>{month}</td>
                        
                        {["sales", "gross_profit", "net_profit", "profit_percentage", "production_amount", "sold_amount"]
                          .map((field) => {
                            
                            let displayValue = "";
                            let unit = "تومان";
                            let columnWidth = 140; 
                            let maxLength = undefined;
                            
                            if (field === "profit_percentage") {
                              unit = "%";
                              columnWidth = 40;
                              maxLength = 3;
                              displayValue = group.data[i][field]; 
                            } else if (field === "production_amount" || field === "sold_amount") {
                              unit = "عدد";
                              columnWidth = 100;
                              displayValue = formatNumber(group.data[i][field]);
                            } else {
                              unit = "تومان";
                              columnWidth = 140;
                              displayValue = formatNumber(group.data[i][field]);
                            }

                            const specificTdStyle = {
                              ...tdStyle, 
                              width: `${columnWidth}px`,
                              minWidth: `${columnWidth}px`,
                              maxWidth: `${columnWidth}px`,
                            };

                            return (
                              <td style={specificTdStyle} key={field}>
                                {copyMode ? (
                                  <span>{displayValue || 0} {group.data[i][field] && unit}</span>
                                ) : (
                                  <TextField
                                    value={displayValue}
                                    onChange={(e) => {
                                      let raw = e.target.value.replace(/[^\d]/g, "");
                                      if (field === "profit_percentage" && raw.length > 3) {
                                        raw = raw.slice(0, 3);
                                      }
                                      handleCellChange(gIdx, i, field, raw);
                                    }}
                                    onPaste={(e) => handlePaste(gIdx, i, e)}
                                    inputProps={{ maxLength: maxLength }}
                                    InputProps={{
                                      endAdornment: group.data[i][field] !== "" && (
                                        <InputAdornment position="end" sx={adornmentStyle}>
                                          {unit}
                                        </InputAdornment>
                                      ),
                                      sx: { "& input": { textAlign: "center" } }
                                    }}
                                    variant="standard"
                                    style={{ width: "100%" }}
                                  />
                                )}
                              </td>
                            );
                          })}
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
  );
}