document.addEventListener('DOMContentLoaded', () => {
    const admissionForm = document.getElementById('admissionForm');
    const studentPictureInput = document.getElementById('studentPicture');
    const imagePreview = document.getElementById('imagePreview');
    const photoPreviewFrame = document.getElementById('photoPreviewFrame');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const uploadDropzone = document.getElementById('uploadDropzone');
    const successMessage = document.getElementById('successMessage');
    const downloadSlipBtn = document.getElementById('downloadSlipBtn');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const resetBtn = document.getElementById('resetBtn');
    const formCard = document.getElementById('form-card');
    const heroBanner = document.getElementById('hero-banner');
    const courseSelection = document.getElementById('courseSelection');
    const courseGrid = document.getElementById('courseGrid');
    const courseCards = document.querySelectorAll('.course-card');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressRing = document.getElementById('progressRing');
    const circularProgress = document.getElementById('circularProgress');

    const PROGRESS_RING_CIRCUMFERENCE = 213.6;
    const SECTION_WEIGHTS = {
        student: 40,
        course: 20,
        additional: 20,
        addressPhoto: 20
    };

    const slipPhoto = document.getElementById('slipPhoto');
    const slipName = document.getElementById('slipName');
    const slipFatherName = document.getElementById('slipFatherName');
    const slipCourse = document.getElementById('slipCourse');
    const slipDay = document.getElementById('slipDay');
    const slipInstructor = document.getElementById('slipInstructor');
    const slipTiming = document.getElementById('slipTiming');
    const admissionSlip = document.getElementById('admissionSlip');

    const COURSE_TIMING = '4PM–6PM / 5PM–7PM';

    const fields = [
        { input: document.getElementById('studentName'), error: document.getElementById('studentNameError') },
        { input: document.getElementById('fatherName'), error: document.getElementById('fatherNameError') },
        { input: document.getElementById('mobileNumber'), error: document.getElementById('mobileNumberError') },
        { input: document.getElementById('emailAddress'), error: document.getElementById('emailAddressError') },
        { input: courseSelection, error: document.getElementById('courseSelectionError') },
        { input: document.getElementById('gender'), error: document.getElementById('genderError') },
        { input: document.getElementById('address'), error: document.getElementById('addressError') },
        { input: studentPictureInput, error: document.getElementById('studentPictureError') }
    ];

    let currentPhotoDataUrl = '';

    function isStudentSectionComplete() {
        const studentName = document.getElementById('studentName').value.trim();
        const fatherName = document.getElementById('fatherName').value.trim();
        const mobileNumber = document.getElementById('mobileNumber').value.trim();
        const emailAddress = document.getElementById('emailAddress').value.trim();
        return Boolean(studentName && fatherName && mobileNumber && emailAddress);
    }

    function isCourseSectionComplete() {
        return Boolean(courseSelection.value.trim());
    }

    function isAdditionalSectionComplete() {
        return Boolean(document.getElementById('gender').value.trim());
    }

    function isAddressPhotoSectionComplete() {
        const address = document.getElementById('address').value.trim();
        const hasPhoto = Boolean(studentPictureInput.files[0] || currentPhotoDataUrl);
        return Boolean(address && hasPhoto);
    }

    function calculateProgress() {
        let progress = 0;
        if (isStudentSectionComplete()) progress += SECTION_WEIGHTS.student;
        if (isCourseSectionComplete()) progress += SECTION_WEIGHTS.course;
        if (isAdditionalSectionComplete()) progress += SECTION_WEIGHTS.additional;
        if (isAddressPhotoSectionComplete()) progress += SECTION_WEIGHTS.addressPhoto;
        return progress;
    }

    function updateProgress() {
        const progress = calculateProgress();
        progressBarFill.style.width = `${progress}%`;
        progressPercent.textContent = `${progress}%`;
        progressRing.style.strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress / 100);
        circularProgress.setAttribute('aria-label', `${progress}% complete`);
    }

    function setFieldError(input, error, message) {
        if (input) {
            input.classList.add('is-invalid');
        }
        if (input === courseSelection && courseGrid) {
            courseGrid.classList.add('is-invalid');
        }
        if (error) {
            error.textContent = message;
        }
    }

    function clearFieldError(input, error) {
        if (input) {
            input.classList.remove('is-invalid');
        }
        if (input === courseSelection && courseGrid) {
            courseGrid.classList.remove('is-invalid');
        }
        if (error) {
            error.textContent = '';
        }
    }

    function clearAllErrors() {
        fields.forEach(({ input, error }) => clearFieldError(input, error));
    }

    function validateTextField(input, error, message) {
        const value = input.value.trim();
        if (!value) {
            setFieldError(input, error, message);
            return false;
        }
        clearFieldError(input, error);
        return true;
    }

    function validateEmailField() {
        const input = document.getElementById('emailAddress');
        const error = document.getElementById('emailAddressError');
        const value = input.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
            setFieldError(input, error, 'Please enter your email address.');
            return false;
        }

        if (!emailPattern.test(value)) {
            setFieldError(input, error, 'Please enter a valid email address.');
            return false;
        }

        clearFieldError(input, error);
        return true;
    }

    function validateMobileField() {
        const input = document.getElementById('mobileNumber');
        const error = document.getElementById('mobileNumberError');
        const value = input.value.trim();
        const mobilePattern = /^(\+92|92|0)3[0-9]{9}$/;

        if (!value) {
            setFieldError(input, error, 'Please enter your mobile number.');
            return false;
        }

        if (!mobilePattern.test(value)) {
            setFieldError(input, error, 'Please enter a valid Pakistani mobile number.');
            return false;
        }

        clearFieldError(input, error);
        return true;
    }

    function validateCourseSelection() {
        const error = document.getElementById('courseSelectionError');
        if (!courseSelection.value.trim()) {
            setFieldError(courseSelection, error, 'Please select a course.');
            return false;
        }
        clearFieldError(courseSelection, error);
        return true;
    }

    function validatePhotoSelection(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve('Please upload a student photograph.');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                resolve('Only JPG, JPEG and PNG images are allowed.');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                resolve('Image size must be less than 2 MB.');
                return;
            }

            const image = new Image();
            const reader = new FileReader();
            reader.onload = (e) => {
                image.onload = () => {
                    const aspectRatio = image.width / image.height;
                    if (image.width < 200 || image.height < 200 || aspectRatio < 0.6 || aspectRatio > 1.4) {
                        resolve('Please upload a clear front-facing passport photo.');
                        return;
                    }
                    resolve('');
                };
                image.onerror = () => resolve('Please upload a clear front-facing passport photo.');
                image.src = e.target.result;
            };
            reader.onerror = () => resolve('Please upload a clear front-facing passport photo.');
            reader.readAsDataURL(file);
        });
    }

    function scrollToFirstError() {
        const invalidField = document.querySelector('.is-invalid, .course-grid.is-invalid');
        if (invalidField) {
            invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function selectCourse(card) {
        courseCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        courseSelection.value = card.dataset.course;
        document.getElementById('courseDay').value = card.dataset.day || '';
        document.getElementById('courseInstructor').value = card.dataset.instructor || '';
        document.getElementById('courseTime').value = card.dataset.time || '';
        clearFieldError(courseSelection, document.getElementById('courseSelectionError'));
        updateProgress();
    }

    courseCards.forEach(card => {
        card.addEventListener('click', () => selectCourse(card));
    });

    function resetPhotoPreview() {
        currentPhotoDataUrl = '';
        imagePreview.src = '#';
        photoPreviewFrame.classList.remove('has-image');
        slipPhoto.src = '#';
    }

    function showPhotoPreview(dataUrl) {
        currentPhotoDataUrl = dataUrl;
        imagePreview.src = dataUrl;
        photoPreviewFrame.classList.add('has-image');
        slipPhoto.src = dataUrl;
    }

    async function handlePhotoFile(file) {
        const errorEl = document.getElementById('studentPictureError');

        if (!file) {
            resetPhotoPreview();
            setFieldError(studentPictureInput, errorEl, 'Please upload a student photograph.');
            updateProgress();
            return;
        }

        const validationMessage = await validatePhotoSelection(file);
        if (validationMessage) {
            resetPhotoPreview();
            studentPictureInput.value = '';
            setFieldError(studentPictureInput, errorEl, validationMessage);
            updateProgress();
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            showPhotoPreview(e.target.result);
            clearFieldError(studentPictureInput, errorEl);
            updateProgress();
        };
        reader.readAsDataURL(file);
    }

    uploadDropzone.addEventListener('click', () => studentPictureInput.click());

    uploadDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadDropzone.classList.add('drag-over');
    });

    uploadDropzone.addEventListener('dragleave', () => {
        uploadDropzone.classList.remove('drag-over');
    });

    uploadDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadDropzone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            const dt = new DataTransfer();
            dt.items.add(file);
            studentPictureInput.files = dt.files;
            handlePhotoFile(file);
        }
    });

    studentPictureInput.addEventListener('change', function() {
        handlePhotoFile(this.files[0]);
    });

    fields.forEach(({ input, error }) => {
        if (input === courseSelection || input === studentPictureInput) return;

        input.addEventListener('input', () => {
            if (input === document.getElementById('studentName')) {
                validateTextField(input, error, 'Please enter student name.');
            } else if (input === document.getElementById('fatherName')) {
                validateTextField(input, error, 'Please enter father\'s name.');
            } else if (input === document.getElementById('mobileNumber')) {
                validateMobileField();
            } else if (input === document.getElementById('emailAddress')) {
                validateEmailField();
            } else if (input === document.getElementById('gender')) {
                validateTextField(input, error, 'Please select gender.');
            } else if (input === document.getElementById('address')) {
                validateTextField(input, error, 'Please enter your address.');
            }
            updateProgress();
        });

        input.addEventListener('change', () => updateProgress());
    });

    function resetForm() {
        admissionForm.reset();
        clearAllErrors();
        courseCards.forEach(c => c.classList.remove('selected'));
        courseSelection.value = '';
        resetPhotoPreview();
        studentPictureInput.value = '';
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetBtn.addEventListener('click', resetForm);

    admissionForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        clearAllErrors();

        const isStudentNameValid = validateTextField(document.getElementById('studentName'), document.getElementById('studentNameError'), 'Please enter student name.');
        const isFatherNameValid = validateTextField(document.getElementById('fatherName'), document.getElementById('fatherNameError'), 'Please enter father\'s name.');
        const isMobileValid = validateMobileField();
        const isEmailValid = validateEmailField();
        const isCourseValid = validateCourseSelection();
        const isGenderValid = validateTextField(document.getElementById('gender'), document.getElementById('genderError'), 'Please select gender.');
        const isAddressValid = validateTextField(document.getElementById('address'), document.getElementById('addressError'), 'Please enter your address.');

        const photoFile = studentPictureInput.files[0];
        let isPhotoValid = true;
        let photoErrorMessage = '';
        if (!photoFile) {
            photoErrorMessage = 'Please upload a student photograph.';
            isPhotoValid = false;
        } else {
            photoErrorMessage = await validatePhotoSelection(photoFile);
            if (photoErrorMessage) {
                isPhotoValid = false;
            }
        }

        if (!isPhotoValid) {
            setFieldError(studentPictureInput, document.getElementById('studentPictureError'), photoErrorMessage);
        } else {
            clearFieldError(studentPictureInput, document.getElementById('studentPictureError'));
        }

        const isFormValid = isStudentNameValid && isFatherNameValid && isMobileValid && isEmailValid && isCourseValid && isGenderValid && isAddressValid && isPhotoValid;

        if (!isFormValid) {
            scrollToFirstError();
            return;
        }

        const studentName = document.getElementById('studentName').value.trim();
        const fatherName = document.getElementById('fatherName').value.trim();
        const courseName = courseSelection.value;
        const courseDay = document.getElementById('courseDay').value;
        const courseInstructor = document.getElementById('courseInstructor').value;
        const courseTime = document.getElementById('courseTime').value;

        slipName.textContent = studentName;
        slipFatherName.textContent = fatherName;
        slipCourse.textContent = courseName;
        slipDay.textContent = courseDay;
        slipInstructor.textContent = courseInstructor;
        slipTiming.textContent = courseTime;
        slipPhoto.src = currentPhotoDataUrl;

        admissionForm.style.display = 'none';
        heroBanner.style.display = 'none';
        document.querySelector('.progress-card').style.display = 'none';
        successMessage.style.display = 'block';
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    downloadSlipBtn.addEventListener('click', async function() {
        const slipContainer = document.getElementById('slipContainer');
        const studentNameValue = document.getElementById('studentName').value.trim();
        const safeName = studentNameValue.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Student';

        slipContainer.classList.add('is-visible');
        document.body.style.overflow = 'hidden';

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const imageLoad = new Promise((resolve) => {
            const tempImage = new Image();
            tempImage.onload = resolve;
            tempImage.onerror = resolve;
            tempImage.src = slipPhoto.src;
        });

        const logoLoad = new Promise((resolve) => {
            const tempLogo = new Image();
            tempLogo.onload = resolve;
            tempLogo.onerror = resolve;
            tempLogo.src = document.querySelector('.slip-logo').src;
        });

        await Promise.all([imageLoad, logoLoad]);
        await new Promise((resolve) => setTimeout(resolve, 200));

        const opt = {
            margin: [0.25, 0.25, 0.25, 0.25],
            filename: `${safeName}_AdmissionSlip.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            },
            jsPDF: { unit: 'in', format: 'a5', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(admissionSlip).save();
        } finally {
            slipContainer.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
    });

    resetFormBtn.addEventListener('click', () => {
        resetForm();
        successMessage.style.display = 'none';
        admissionForm.style.display = 'block';
        heroBanner.style.display = 'grid';
        document.querySelector('.progress-card').style.display = 'block';
        updateProgress();
    });

    updateProgress();
});
