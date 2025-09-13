# workshops/admin.py
from django.contrib import admin
from .models import Workshop, WorkshopImage

# یک اینلاین (inline) برای نمایش و مدیریت تصاویر گالری در صفحه ویرایش کارگاه
class WorkshopImageInline(admin.TabularInline):
    model = WorkshopImage
    extra = 1  # تعداد فرم‌های خالی برای آپلود تصویر جدید
    readonly_fields = ('image_preview',)
    fields = ('image', 'image_preview', 'uploaded_at')

    def image_preview(self, obj):
        from django.utils.html import format_html
        if obj.image:
            return format_html('<img src="{}" width="150" height="auto" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'پیش‌نمایش تصویر'


# کلاس ادمین برای مدل اصلی Workshop
@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    # اینلاین تصاویر را اضافه می‌کنیم تا در صفحه ویرایش کارگاه نمایش داده شود
    inlines = [WorkshopImageInline]

    # فیلدهایی که در لیست کارگاه‌ها در پنل ادمین نمایش داده می‌شوند
    # از نام‌های صحیح موجود در models.py استفاده می‌کنیم
    list_display = (
        'title', 
        'owner', 
        'contact_number', 
        'location', 
        'required_capital',
        'profit_percentage',
        'created_at',
        'updated_at',
    )
    
    # فیلترهایی که در سمت راست پنل ادمین برای فیلتر کردن لیست نمایش داده می‌شوند
    list_filter = ('created_at', 'owner', 'location')
    
    # فیلدهایی که قابلیت جستجو دارند
    search_fields = ('title', 'description', 'owner__username', 'contact_number')
    
    # ترتیب نمایش پیش‌فرض
    ordering = ('-created_at',)
    
    # فیلدهایی که فقط خواندنی هستند (مانند تاریخ‌ها)
    readonly_fields = ('created_at', 'updated_at')

    # نحوه چینش فیلدها در فرم ویرایش/ایجاد ادمین
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('title', 'owner', 'description', 'cover_image')
        }),
        ('اطلاعات تماس و مکان', {
            'fields': ('agency', 'contact_number', 'location', 'product_type')
        }),
        ('اطلاعات مالی و قرارداد', {
            'fields': ('required_capital', 'profit_percentage', 'contract_duration', 'contract_details')
        }),
        ('تاریخ‌ها', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)  # این بخش به صورت پیش‌فرض بسته باشد
        }),
    )

# ثبت مدل WorkshopImage به صورت جداگانه (اختیاری، چون از طریق اینلاین قابل مدیریت است)
@admin.register(WorkshopImage)
class WorkshopImageAdmin(admin.ModelAdmin):
    list_display = ('workshop', 'image_preview', 'uploaded_at')
    list_filter = ('workshop__title',)
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        from django.utils.html import format_html
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.image.url)
        return "—"
    image_preview.short_description = 'پیش‌نمایش'
