// static/js/workshop_form.js

document.addEventListener('DOMContentLoaded', function () {
    // 1. گرفتن المان‌های ضروری از HTML
    const fileInput = document.getElementById('id_images');         // اینپوت اصلی فایل جنگو (که مخفی است)
    const uploadArea = document.getElementById('file-upload-area'); // کادر بزرگ قابل کلیک
    const countSpan = document.getElementById('selected-files-count');   // متنی که تعداد فایل‌ها را نشان می‌دهد
    const fileListUl = document.getElementById('selected-files-list');   // لیست نام فایل‌ها

    // بررسی وجود المان‌ها برای جلوگیری از خطا
    if (!fileInput || !uploadArea || !countSpan || !fileListUl) {
        console.error("یکی از المان‌های ضروری برای آپلود فایل در HTML پیدا نشد. لطفاً id ها را در workshop_form.html چک کنید.");
        return; // اگر المانی پیدا نشد، اجرای اسکریپت متوقف می‌شود
    }

    // 2. رویداد کلیک: وقتی روی کادر طراحی‌شده کلیک شد، اینپوت اصلی فایل را فعال کن
    uploadArea.addEventListener('click', function () {
        fileInput.click();
    });
    
    // (اختیاری) مدیریت Drag & Drop - برای تجربه کاربری بهتر
    uploadArea.addEventListener('dragover', function(event) {
        event.preventDefault(); // جلوگیری از رفتار پیش‌فرض مرورگر (باز کردن فایل)
        uploadArea.style.borderColor = '#3498db'; // تغییر رنگ حاشیه هنگام کشیدن فایل روی آن
    });
    
    uploadArea.addEventListener('dragleave', function(event) {
        event.preventDefault();
        uploadArea.style.borderColor = '#a8b5c3'; // بازگرداندن رنگ حاشیه به حالت اولیه
    });

    uploadArea.addEventListener('drop', function(event) {
        event.preventDefault(); // جلوگیری از رفتار پیش‌فرض
        uploadArea.style.borderColor = '#a8b5c3';
        
        // فایل‌های رها شده را به اینپوت اصلی اختصاص بده
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            fileInput.files = droppedFiles;
            // رویداد change را به صورت دستی فراخوانی کن تا UI آپدیت شود
            const changeEvent = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(changeEvent);
        }
    });

    // 3. رویداد تغییر: وقتی فایلی در اینپوت اصلی انتخاب (یا رها) شد، UI را آپدیت کن
    fileInput.addEventListener('change', function () {
        const files = this.files;

        if (files.length > 0) {
            // نمایش تعداد فایل‌های انتخاب شده
            countSpan.textContent = `${files.length} فایل انتخاب شد.`;

            // پاک کردن لیست قبلی
            fileListUl.innerHTML = '';

            // اضافه کردن نام فایل‌های جدید به لیست
            Array.from(files).forEach(file => {
                const li = document.createElement('li');
                li.textContent = file.name;
                fileListUl.appendChild(li);
            });
        } else {
            // اگر هیچ فایلی انتخاب نشده بود
            countSpan.textContent = 'هیچ فایلی انتخاب نشده است.';
            fileListUl.innerHTML = '';
        }
    });
});
