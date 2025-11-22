from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    فقط مالک یا سوپریوزر می‌تواند ویرایش/حذف کند، بقیه فقط می‌توانند بخوانند.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # اضافه کردن دسترسی سوپریوزر
        return obj.owner == request.user or request.user.is_superuser
