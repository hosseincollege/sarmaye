from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    فقط مالک می‌تواند ویرایش/حذف کند، بقیه فقط می‌توانند بخوانند.
    """
    def has_object_permission(self, request, view, obj):
        # همه می‌توانند GET, HEAD, OPTIONS را ببینند
        if request.method in permissions.SAFE_METHODS:
            return True
        # فقط صاحبش می‌تواند ویرایش یا حذف کند
        return obj.owner == request.user
