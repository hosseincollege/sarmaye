# forms.py (نسخه نهایی و ساده شده)

from django import forms
from .models import Workshop

class WorkshopForm(forms.ModelForm):
    class Meta:
        model = Workshop
        # فقط فیلدهایی را که کاربر باید پر کند، لیست می‌کنیم.
        # این بهترین و امن‌ترین روش است.
        fields = [
            'name', 'description', 'cover_image', 'representative', 'phone', 
            'location', 'product_type', 'investment_needed', 
            'profit_percentage', 'duration_months', 'contract_details'
        ]
