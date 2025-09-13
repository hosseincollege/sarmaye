// static/js/workshop_form.js

document.addEventListener('DOMContentLoaded', function () {
    // 1. گرفتن المان‌ها از HTML
    const fileInput = document.getElementById('id_images'); // اینپوت اصلی که توسط جنگو ساخته شده
    const uploadArea = document.getElementById('file-upload-area'); // کادر بزرگ خاکستری
    const countSpan = document.getElementById('selected-files-count'); // متنی که تعداد فایل‌ها را نشان می‌دهد
    const fileListUl = document.getElementById('selected-files-list'); // لیست نام فایل‌ها

    // بررسی می‌کنیم که آیا تمام المان‌ها در صفحه وجود دارند یا نه
    if (!fileInput || !uploadArea || !countSpan || !fileListUl) {
        console.error("یکی از المان‌های ضروری برای آپلود فایل در HTML پیدا نشد. لطفاً id ها را چک کنید.");
        return; // اگر المانی پیدا نشد، ادامه نده
    }

    // 2. وقتی روی کادر خاکستری کلیک شد، روی اینپوت اصلی فایل کلیک کن
    uploadArea.addEventListener('click', function () {
        fileInput.click();
    });

    // 3. وقتی فایلی در اینپوت اصلی انتخاب شد، UI را آپدیت کن
    fileInput.addEventListener('change', function () {
        const files = this.files;

        if (files.length > 0) {
            // نمایش تعداد فایل‌های انتخاب شده
            countSpan.textContent = `${files.length} فایل انتخاب شده است.`;
            
            // پاک کردن لیست قبلی
            fileListUl.innerHTML = '';
            
            // اضافه کردن نام فایل‌های جدید به لیست
            Array.from(files).forEach(file => {
                const li = document.createElement('li');
                li.textContent = file.name;
                fileListUl.appendChild(li);
            });
        } else {
            // اگر فایلی انتخاب نشده بود
            countSpan.textContent = 'هیچ فایلی انتخاب نشده است.';
            fileListUl.innerHTML = '';
        }
    });
});
