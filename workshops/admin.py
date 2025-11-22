# workshops/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Workshop, WorkshopImage, Product, Customer, TeamCategory,
    Manager, InvestmentStage, MonthlyReport
)

# --- تعریف Inlineها (بدون تغییر، کد شما عالی است) ---

class WorkshopImageInline(admin.TabularInline):
    model = WorkshopImage
    extra = 1
    readonly_fields = ('image_preview',)
    fields = ('image', 'image_preview')
    verbose_name = "تصویر گالری"
    verbose_name_plural = "تصاویر گالری"

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="150" />', obj.image.url)
        return "بدون تصویر"
    image_preview.short_description = 'پیش‌نمایش'


class ProductInline(admin.TabularInline):
    model = Product
    extra = 1
    verbose_name = "محصول"
    verbose_name_plural = "محصولات"


class TeamCategoryInline(admin.TabularInline):
    model = TeamCategory
    extra = 1
    verbose_name = "دسته بندی تیم"
    verbose_name_plural = "دسته بندی‌های تیم"


class InvestmentStageInline(admin.TabularInline):
    model = InvestmentStage
    extra = 1
    verbose_name = "مرحله سرمایه‌گذاری"
    verbose_name_plural = "مراحل سرمایه‌گذاری"


class MonthlyReportInline(admin.TabularInline):
    model = MonthlyReport
    extra = 1
    verbose_name = "گزارش ماهانه"
    verbose_name_plural = "گزارش‌های ماهانه"


class ManagerInline(admin.StackedInline):
    model = Manager
    extra = 0
    max_num = 1
    verbose_name = "مدیر"
    verbose_name_plural = "مدیران"


# --- کلاس اصلی WorkshopAdmin با بهبودهای لازم ---

from django.contrib import admin
from .models import Workshop

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    # لیست نمایش در جدول ادمین
    list_display = [
        'id', 
        'title', 
        'category',

        'province', 
        'required_capital', 
        'start_date'
    ]

    # فیلترهای کناری
    list_filter = ['category', 'province']

    search_fields = ['title', 'description', 'province', 'product_type']
    
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

    # === نکته کلیدی: جدا کردن inlines و fieldsets برای صفحات Add و Change ===

    def get_inlines(self, request, obj=None):
        """
        این متد inlines را فقط در صفحه ویرایش (Change) نمایش می‌دهد
        و در صفحه ایجاد (Add) آن‌ها را مخفی می‌کند.
        `obj=None` به این معنی است که ما در صفحه "Add" هستیم.
        """
        if obj is None:
            return []  # در صفحه ایجاد، هیچ inlineای نمایش نده
        return [
            ManagerInline,
            WorkshopImageInline,
            ProductInline,
            TeamCategoryInline,
            InvestmentStageInline,
            MonthlyReportInline,
        ]

    def get_fieldsets(self, request, obj=None):
        """
        این متد fieldsetها را برای صفحات Add و Change سفارشی می‌کند.
        """
        # فیلدست‌های مشترک برای هر دو صفحه
        base_fieldsets = (
            ('اطلاعات اصلی', {
                'fields': ('owner', 'title', 'description', 'cover_image'),
                'description': "لطفاً ابتدا اطلاعات اصلی کارگاه را وارد و ذخیره کنید. پس از ذخیره، می‌توانید جزئیات دیگر مانند محصولات، تیم و تصاویر گالری را اضافه نمایید." if obj is None else ""
            }),
            ('اطلاعات تماس و قرارداد', {
                'fields': (
                    'contact_number', 'product_type', 'required_capital',
                )
            }),
            ('اطلاعات تکمیلی و مالی', {
                'fields': ('location', 'start_date')
            }),
        )
        
        # اگر در صفحه ویرایش هستیم (یک آبجکت کارگاه وجود دارد)، فیلدست تاریخ‌ها را اضافه کن
        if obj:
            return base_fieldsets + (
                ('تاریخ‌ها', {
                    'fields': ('created_at', 'updated_at'),
                    'classes': ('collapse',)
                }),
            )
        
        # در غیر این صورت (صفحه ایجاد)، فقط فیلدست‌های پایه را برگردان
        return base_fieldsets

# ثبت بقیه مدل‌ها برای مدیریت مستقیم (این بخش از کد شما عالی و کامل است)
@admin.register(WorkshopImage)
class WorkshopImageAdmin(admin.ModelAdmin):
    list_display = ('workshop', 'image_preview', 'uploaded_at')
    list_filter = ('workshop__title',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.image.url)
        return "—"
    image_preview.short_description = 'پیش‌نمایش'

class CustomerInline(admin.TabularInline):
    model = Customer
    extra = 1
    verbose_name = "مشتری"
    verbose_name_plural = "مشتریان"

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'workshop', 'monthly_volume')
    list_filter = ('workshop__title',)
    search_fields = ('name',)
    inlines = [CustomerInline] # اضافه کردن اینلاین مشتریان در صفحه محصول

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'monthly_order_volume')
    list_filter = ('product__workshop__title', 'product__name')
    search_fields = ('name',)

admin.site.register(TeamCategory)
admin.site.register(InvestmentStage)
admin.site.register(MonthlyReport)
admin.site.register(Manager)
