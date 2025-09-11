from django.contrib import admin
from django.utils.html import format_html
from .models import Workshop, WorkshopImage

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'representative', 'phone', 'location',
        'product_type', 'investment_needed', 'funded_percentage', 'cover_preview'
    )
    search_fields = ('name', 'representative', 'location', 'product_type')
    list_filter = ('product_type', 'location')
    ordering = ('name',)

    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.cover_image.url)
        return "(No Image)"
    cover_preview.short_description = "کاور"

@admin.register(WorkshopImage)
class WorkshopImageAdmin(admin.ModelAdmin):
    list_display = ('workshop', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.image.url)
        return "(No Image)"
    image_preview.short_description = "تصویر"
