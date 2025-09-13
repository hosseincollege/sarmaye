document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('deleteModal');
    var deleteButtons = document.querySelectorAll('.btn-delete');
    var span = document.getElementsByClassName("close-btn")[0];
    var cancelBtn = document.getElementById('cancelDeleteBtn');
    var deleteForm = document.getElementById('deleteForm');
    var modalMessage = document.getElementById('modalMessage');

    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var workshopId = this.getAttribute('data-workshop-id');
            var workshopName = this.getAttribute('data-workshop-name');

            modal.style.display = "block";
            modalMessage.textContent = 'آیا از حذف کارگاه "' + workshopName + '" مطمئن هستید؟';
            deleteForm.action = '/workshop/' + workshopId + '/delete/'; // Replace with your actual URL
        });
    });

    span.onclick = function() {
        modal.style.display = "none";
    }

    cancelBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});