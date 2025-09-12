from django import forms
from django.forms import inlineformset_factory
from .models import Workshop, WorkshopImage

class WorkshopForm(forms.ModelForm):
    class Meta:
        model = Workshop
        fields = [
            'name', 'description', 'cover_image', 'representative', 'phone', 
            'location', 'product_type', 'investment_needed', 'funded_percentage', 
            'profit_percentage', 'duration_months', 'contract_details'
        ]

# پارامتر extra را برای نمایش چندین فیلد آپلود تصویر تنظیم کنید
WorkshopImageFormSet = inlineformset_factory(
    Workshop,
    WorkshopImage,
    fields=('image',),
    extra=3,  # این مقدار را به تعداد مورد نظر خود برای آپلود همزمان تغییر دهید.
    can_delete=True
)