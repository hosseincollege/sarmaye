from django import forms
from .models import Workshop

# ویجت سفارشی که multiple رو پشتیبانی می‌کنه
class MultiImageInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class WorkshopForm(forms.ModelForm):
    uploaded_images = forms.ImageField(
        widget=MultiImageInput(attrs={'multiple': True}),
        required=False,
        label="عکس‌های کارگاه"
    )

    class Meta:
        model = Workshop
        fields = '__all__'
