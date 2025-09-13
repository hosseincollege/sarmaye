// فایل: static/js/modal.js

document.addEventListener('DOMContentLoaded', function() {
    // گرفتن عناصر مودال از DOM
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImage");
    var span = document.getElementsByClassName("close")[0];

    // گرفتن تمام تصاویر گالری که قابلیت باز شدن در مودال را دارند
    var images = document.querySelectorAll('.modal-trigger');

    // اضافه کردن رویداد کلیک به هر تصویر
    images.forEach(function(img) {
        img.onclick = function() {
            modal.style.display = "block";
            modalImg.src = this.src;
        }
    });

    // تعریف عملکرد دکمه بستن (×)
    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }
    
    // بستن مودال با کلیک روی هر جای صفحه به جز خود تصویر
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
