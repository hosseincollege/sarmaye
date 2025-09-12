from django import forms
from .models import Workshop

class WorkshopForm(forms.ModelForm):
    class Meta:
        model = Workshop
        fields = '__all__'


# ویجت سفارشی که multiple رو پشتیبانی می‌کنه
class MultiImageInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class WorkshopForm(forms.ModelForm):
    uploaded_images = forms.FileField(
        widget=MultiImageInput(attrs={'multiple': True, 'accept': 'image/*'}),
        required=False,
        label="عکس‌های کارگاه"
    )


    class Meta:
        model = Workshop
        fields = '__all__'
