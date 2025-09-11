from rest_framework import serializers
from .models import Workshop, WorkshopImage
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class WorkshopImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = WorkshopImage
        fields = ['id', 'image']

class WorkshopSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)  # اضافه کردن اطلاعات مالک
    cover_image = serializers.ImageField(use_url=True, required=False)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=None, allow_empty_file=False, use_url=True),
        write_only=True,
        required=False
    )
    # خروجی عکس‌ها
    uploaded_images_urls = WorkshopImageSerializer(source='workshopimage_set', many=True, read_only=True)

    class Meta:
        model = Workshop
        fields = '__all__'

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        workshop = Workshop.objects.create(**validated_data)
        for image in uploaded_images:
            WorkshopImage.objects.create(workshop=workshop, image=image)
        return workshop
