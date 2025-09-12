document.getElementById('id_images').addEventListener('change', function () {
    var fileCount = this.files.length;
    var fileCountSpan = document.getElementById('file-count');
    if (fileCount > 0) {
        fileCountSpan.textContent = fileCount + ' فایل انتخاب شده است.';
    } else {
        fileCountSpan.textContent = 'هیچ فایلی انتخاب نشده است.';
    }
});
