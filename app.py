from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session, send_file
from flask_cors import CORS
from functools import wraps
import pandas as pd
import qrcode
import os
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename

# إنشاء التطبيق
app = Flask(__name__)
app.secret_key = 'zawiya-tijania-secret-key-2026'
CORS(app)

# إعدادات المسارات
EXCEL_FILE = 'data/students.xlsx'
CONTACT_FILE = 'data/contacts.xlsx'
QRCODE_DIR = 'static/qrcodes'
UPLOAD_FOLDER = 'static/uploads'

# بيانات الأدمن
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin'

# إنشاء المجلدات
for folder in ['data', QRCODE_DIR, UPLOAD_FOLDER, 'static/images']:
    os.makedirs(folder, exist_ok=True)

# إنشاء ملف Excel للطلاب
if not os.path.exists(EXCEL_FILE):
    df = pd.DataFrame(columns=[
        'رقم التسجيل', 'معرف فريد', 'الاسم', 'اللقب', 'العمر',
        'الجنس', 'مكان الإقامة', 'الولاية', 'رقم الهاتف',
        'البريد الإلكتروني', 'البرنامج المختار', 'تاريخ التسجيل', 'الحالة'
    ])
    df.to_excel(EXCEL_FILE, index=False, engine='openpyxl')

# إنشاء ملف Excel للرسائل
if not os.path.exists(CONTACT_FILE):
    df = pd.DataFrame(columns=[
        'رقم', 'الاسم', 'البريد الإلكتروني', 'رقم الهاتف',
        'الموضوع', 'الرسالة', 'التاريخ', 'الحالة'
    ])
    df.to_excel(CONTACT_FILE, index=False, engine='openpyxl')

# بيانات البرامج التعليمية
PROGRAMS = [
    {
        'id': 'children',
        'name': 'برنامج حفظ القرآن للأطفال',
        'age_range': '7-14 سنة',
        'description': 'برنامج متخصص لتحفيظ القرآن الكريم للأطفال مع التركيز على التجويد والترتيل',
        'duration': 'سنتان',
        'icon': 'fa-child'
    },
    {
        'id': 'adults',
        'name': 'برنامج حفظ القرآن للكبار',
        'age_range': '15 سنة فما فوق',
        'description': 'برنامج شامل يجمع بين الحفظ والتفسير والتطبيق العملي',
        'duration': 'ثلاث سنوات',
        'icon': 'fa-book-quran'
    },
    {
        'id': 'review',
        'name': 'برنامج المراجعة والتثبيت',
        'age_range': 'جميع الأعمار',
        'description': 'جلسات خاصة لمراجعة المحفوظ وتثبيته مع تقييم مستمر',
        'duration': 'مستمر',
        'icon': 'fa-repeat'
    },
    {
        'id': 'tijani',
        'name': 'المجالس التجانية',
        'age_range': 'جميع الأعمار',
        'description': 'جلسات أسبوعية للذكر والأوراد والتوجيه الروحي',
        'duration': 'مستمر',
        'icon': 'fa-mosque'
    }
]

# جدول الحصص الأسبوعي
SCHEDULE = [
    {
        'id': 1,
        'title': 'حصة حفظ القرآن للأطفال',
        'day': 'السبت',
        'time': '14:00 - 16:00',
        'teacher': 'الشيخ محمد الأمين التيجاني',
        'program': 'children',
        'meet_link': 'https://meet.google.com/abc-defg-hij',
        'description': 'حصة مخصصة لتحفيظ القرآن الكريم للأطفال من 7 إلى 14 سنة مع التركيز على التجويد والترتيل الصحيح',
        'level': 'مبتدئ - متوسط'
    },
    {
        'id': 2,
        'title': 'حصة حفظ القرآن للكبار',
        'day': 'الأحد',
        'time': '15:00 - 17:00',
        'teacher': 'الشيخ عبد الرحمان بن عمر',
        'program': 'adults',
        'meet_link': 'https://meet.google.com/klm-nopq-rst',
        'description': 'حصة شاملة لحفظ ومراجعة القرآن الكريم مع دراسة التفسير والمعاني والأحكام',
        'level': 'جميع المستويات'
    },
    {
        'id': 3,
        'title': 'درس الفقه والسيرة النبوية',
        'day': 'الاثنين',
        'time': '16:00 - 17:30',
        'teacher': 'الشيخ أحمد بن الحاج',
        'program': 'adults',
        'meet_link': 'https://meet.google.com/uvw-xyz-abc',
        'description': 'دروس متخصصة في الفقه الإسلامي والسيرة النبوية الشريفة وفق المذهب المالكي',
        'level': 'متوسط - متقدم'
    },
    {
        'id': 4,
        'title': 'حلقة المراجعة والتثبيت',
        'day': 'الثلاثاء',
        'time': '17:00 - 18:30',
        'teacher': 'الشيخ عمر الصالحي',
        'program': 'review',
        'meet_link': 'https://meet.google.com/mno-pqr-stu',
        'description': 'حلقة خاصة لمراجعة المحفوظ وتثبيته مع اختبارات دورية لتقييم التقدم',
        'level': 'جميع المستويات'
    },
    {
        'id': 5,
        'title': 'المجلس التجاني - الوظيفة والأوراد',
        'day': 'الجمعة',
        'time': '13:00 - 14:30',
        'teacher': 'شيخ الزاوية',
        'program': 'tijani',
        'meet_link': 'https://meet.google.com/def-ghi-jkl',
        'description': 'مجلس أسبوعي للذكر والوظيفة التجانية والأوراد مع التوجيه الروحي والتربوي',
        'level': 'جميع المستويات'
    },
    {
        'id': 6,
        'title': 'درس التفسير وعلوم القرآن',
        'day': 'الأربعاء',
        'time': '15:30 - 17:00',
        'teacher': 'الشيخ محمد الأمين التيجاني',
        'program': 'adults',
        'meet_link': 'https://meet.google.com/vwx-yz-abc',
        'description': 'دروس متعمقة في تفسير القرآن الكريم وعلوم القرآن والقراءات',
        'level': 'متقدم'
    }
]

# الهيكل التنظيمي
STRUCTURE = {
    'leadership': [
        {
            'name': 'الخليفة الشيخ سيدي محمد العيد التجاني التماسيني',
            'position': 'شيخ الطريقة التجانية',
            'description': 'مؤسس الطريقة التجانية ومرشدها الروحي',
            'image': 'sheikh-tijani.jpeg'
        }
    ],
    'administration': [
        {
            'name': 'محمد البشير بن جعوان',
            'position': 'مدير المدرسة الإلكترونية',
            'email': 'director@zawiya-tijania.dz',
            'phone': '+213 555 123 456',
            'description': 'إشراف عام على المدرسة وتطوير البرامج التعليمية',
            'image': 'mohamed-director.jpeg'
        },
        {
            'name': 'نجاح قادير',
            'position': 'المنسق الأكاديمي',
            'email': 'academic@zawiya-tijania.dz',
            'phone': '+213 555 234 567',
            'description': 'تنسيق البرامج والجداول الدراسية'
        },
        {
            'name': 'الأستاذة أمينة التجاني',
            'position': 'مسؤولة قسم الإناث',
            'email': 'women@zawiya-tijania.dz',
            'phone': '+213 555 345 678',
            'description': 'الإشراف على برامج تعليم الإناث'
        }
    ],
    'teachers': [
        {
            'name': 'منى التجاني',
            'position': 'أستاذة الفقه والسيرة',
            'specialization': 'الفقه والسيرة النبوية',
            'experience': '8 سنوات'
        },
        {
            'name': 'نرجس التجاني',
            'position': 'أستاذة التجويد',
            'specialization': 'التجويد وأحكام التلاوة',
            'experience': '6 سنوات'
        },
        {
            'name': 'حدة قزوز',
            'position': 'أستاذة تحفيظ القرآن',
            'specialization': 'تحفيظ القرآن للأطفال',
            'experience': '10 سنوات'
        }
    ],
    'technical': [
        {
            'name': 'المهندس نجاح قادير',
            'position': 'مسؤول الدعم التقني',
            'email': 'tech@zawiya-tijania.dz',
            'description': 'الدعم التقني والمساعدة في استخدام المنصة'
        }
    ]
}

# الإحصائيات
STATISTICS = {
    'students': 1250,
    'graduates': 340,
    'teachers': 15,
    'programs': 4,
    'years': 223
}

# ==================== Decorators ====================

def login_required(f):
    """Decorator لحماية صفحات الأدمن"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# ==================== Public Routes ====================

@app.route('/')
def index():
    """الصفحة الرئيسية"""
    return render_template('index.html',
                         programs=PROGRAMS,
                         statistics=STATISTICS)

@app.route('/register')
def register_page():
    """صفحة التسجيل"""
    return render_template('register.html', programs=PROGRAMS)

@app.route('/contact')
def contact_page():
    """صفحة الاتصال"""
    return render_template('contact.html')

@app.route('/structure')
def structure_page():
    """صفحة الهيكل التنظيمي"""
    return render_template('structure.html', structure=STRUCTURE)

@app.route('/schedule/<student_id>')
def schedule_page(student_id):
    """صفحة جدول الحصص للطالب"""
    try:
        df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
        student = df[df['معرف فريد'] == student_id]
        
        if student.empty:
            flash('معرف الطالب غير صحيح', 'error')
            return redirect(url_for('index'))
        
        student_data = student.iloc[0].to_dict()
        student_program = student_data['البرنامج المختار']
        filtered_schedule = [s for s in SCHEDULE 
                           if s['program'] == student_program or 
                           s['program'] in ['review', 'tijani']]
        
        qrcodes = {}
        for schedule in filtered_schedule:
            qr_filename = f"qr_{schedule['id']}_{student_id}.png"
            qrcodes[schedule['id']] = qr_filename
        
        return render_template('schedule.html',
                             student=student_data,
                             schedules=filtered_schedule,
                             qrcodes=qrcodes,
                             all_programs=PROGRAMS)
    except Exception as e:
        print(f"Error in schedule_page: {str(e)}")
        flash('حدث خطأ في تحميل الجدول', 'error')
        return redirect(url_for('index'))

# ==================== Admin Routes ====================

@app.route('/admin')
def admin_redirect():
    """إعادة توجيه /admin إلى صفحة التسجيل"""
    return redirect(url_for('admin_login'))

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """صفحة تسجيل دخول الأدمن"""
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return jsonify({'success': True})
        else:
            return jsonify({
                'success': False, 
                'message': 'اسم المستخدم أو كلمة المرور خاطئة'
            }), 401
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    """تسجيل خروج الأدمن"""
    session.pop('admin_logged_in', None)
    flash('تم تسجيل الخروج بنجاح', 'success')
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    """لوحة تحكم الأدمن"""
    try:
        df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
        students = df.to_dict('records')
        
        stats = {
            'total': len(df),
            'active': len(df[df['الحالة'] == 'نشط']) if not df.empty else 0,
            'programs': df['البرنامج المختار'].value_counts().to_dict() if not df.empty else {},
            'recent': len(df[pd.to_datetime(df['تاريخ التسجيل'], errors='coerce') >= 
                           pd.Timestamp.now() - pd.Timedelta(days=7)]) if not df.empty else 0
        }
        
        return render_template('admin_dashboard.html', 
                             students=students, 
                             stats=stats,
                             schedules=SCHEDULE,
                             programs=PROGRAMS)
    except Exception as e:
        print(f"Error in admin dashboard: {str(e)}")
        return f"Error loading dashboard: {str(e)}", 500

@app.route('/admin/update-schedule', methods=['POST'])
@login_required
def update_schedule():
    """تحديث رابط حصة"""
    try:
        data = request.get_json()
        schedule_id = int(data['id'])
        new_link = data['meet_link']
        
        for schedule in SCHEDULE:
            if schedule['id'] == schedule_id:
                schedule['meet_link'] = new_link
                
                qr_filename = f"qr_schedule_{schedule_id}_updated.png"
                qr_path = os.path.join(QRCODE_DIR, qr_filename)
                
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4
                )
                qr.add_data(new_link)
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")
                img.save(qr_path)
                
                return jsonify({
                    'success': True, 
                    'message': 'تم تحديث الرابط وإنشاء QR Code جديد',
                    'qr_code': qr_filename
                })
        
        return jsonify({'success': False, 'message': 'الحصة غير موجودة'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/admin/export-students')
@login_required
def export_students():
    """تصدير بيانات الطلاب إلى Excel"""
    try:
        return send_file(
            EXCEL_FILE, 
            as_attachment=True, 
            download_name=f'students_export_{datetime.now().strftime("%Y%m%d")}.xlsx'
        )
    except Exception as e:
        flash(f'خطأ في التصدير: {str(e)}', 'error')
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/get-emails', methods=['POST'])
@login_required
def get_emails():
    """الحصول على إيميلات الطلاب"""
    try:
        data = request.get_json()
        program = data.get('program', 'all')
        
        df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
        
        if program != 'all':
            df = df[df['البرنامج المختار'] == program]
        
        emails = df['البريد الإلكتروني'].tolist()
        
        return jsonify({
            'success': True, 
            'emails': emails,
            'count': len(emails)
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== APIs ====================

@app.route('/api/register', methods=['POST'])
def register_student():
    """API لتسجيل طالب جديد"""
    try:
        data = request.get_json()
        required_fields = ['firstName', 'lastName', 'age', 'phone', 'email', 'address', 'state', 'program']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'الحقل {field} مطلوب'}), 400
        
        df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
        student_id = 'STD' + str(uuid.uuid4())[:8].upper()
        
        new_record = {
            'رقم التسجيل': len(df) + 1,
            'معرف فريد': student_id,
            'الاسم': data['firstName'],
            'اللقب': data['lastName'],
            'العمر': data['age'],
            'الجنس': data.get('gender', 'غير محدد'),
            'مكان الإقامة': data['address'],
            'الولاية': data['state'],
            'رقم الهاتف': data['phone'],
            'البريد الإلكتروني': data['email'],
            'البرنامج المختار': data['program'],
            'تاريخ التسجيل': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'الحالة': 'نشط'
        }
        
        df = pd.concat([df, pd.DataFrame([new_record])], ignore_index=True)
        df.to_excel(EXCEL_FILE, index=False, engine='openpyxl')
        
        create_qr_codes_for_student(student_id, data['program'])
        
        return jsonify({
            'success': True,
            'message': 'تم التسجيل بنجاح',
            'student_id': student_id
        }), 201
    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({'success': False, 'message': f'حدث خطأ: {str(e)}'}), 500

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """API لإرسال رسالة اتصال"""
    try:
        data = request.get_json()
        df = pd.read_excel(CONTACT_FILE, engine='openpyxl')
        
        new_record = {
            'رقم': len(df) + 1,
            'الاسم': data['name'],
            'البريد الإلكتروني': data['email'],
            'رقم الهاتف': data.get('phone', ''),
            'الموضوع': data['subject'],
            'الرسالة': data['message'],
            'التاريخ': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'الحالة': 'جديدة'
        }
        
        df = pd.concat([df, pd.DataFrame([new_record])], ignore_index=True)
        df.to_excel(CONTACT_FILE, index=False, engine='openpyxl')
        
        return jsonify({
            'success': True,
            'message': 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً'
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'حدث خطأ: {str(e)}'}), 500

@app.route('/api/schedules')
def get_schedules():
    """API للحصول على جميع الحصص"""
    return jsonify(SCHEDULE)

@app.route('/api/programs')
def get_programs():
    """API للحصول على البرامج"""
    return jsonify(PROGRAMS)

@app.route('/api/statistics')
def get_statistics():
    """API للإحصائيات"""
    try:
        df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
        stats = {
            'total_students': len(df),
            'active_students': len(df[df['الحالة'] == 'نشط']),
            'programs_distribution': df['البرنامج المختار'].value_counts().to_dict() if not df.empty else {},
            'recent_registrations': len(df[pd.to_datetime(df['تاريخ التسجيل'], errors='coerce') >= 
                                         pd.Timestamp.now() - pd.Timedelta(days=30)]) if not df.empty else 0
        }
        return jsonify(stats)
    except:
        return jsonify(STATISTICS)

# ==================== Helper Functions ====================

def create_qr_codes_for_student(student_id, program):
    """إنشاء QR codes للطالب"""
    relevant_schedules = [s for s in SCHEDULE 
                         if s['program'] == program or 
                         s['program'] in ['review', 'tijani']]
    
    for schedule in relevant_schedules:
        qr_filename = f"qr_{schedule['id']}_{student_id}.png"
        qr_path = os.path.join(QRCODE_DIR, qr_filename)
        
        if not os.path.exists(qr_path):
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4
            )
            qr.add_data(schedule['meet_link'])
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            img.save(qr_path)

# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(e):
    return render_template('index.html', programs=PROGRAMS, statistics=STATISTICS), 404

@app.errorhandler(500)
def server_error(e):
    return "حدث خطأ في الخادم. يرجى المحاولة لاحقاً", 500

# ==================== Main ====================

if __name__ == '__main__':
    import webbrowser
    import threading
    import time
    
    def open_browser():
        """Open browser automatically"""
        time.sleep(2)
        print("\n>>> Opening browser...")
        webbrowser.open('http://localhost:5000')
    
    # Banner
    print("\n" + "=" * 70)
    print(" " * 18 + "ZAWIYA TIJANIA ELECTRONIC SCHOOL")
    print("=" * 70)
    print("\n  Server Status: STARTING...\n")
    print("  [1/3] Loading application...")
    print("  [2/3] Preparing web server...")
    print("  [3/3] Starting on port 5000...")
    print("\n" + "=" * 70)
    print("\n  STATUS: Server is running!\n")
    print("  Access URLs:")
    print("    - http://localhost:5000")
    print("    - http://localhost:5000/admin (Admin Panel)\n")
    print("  [!] Keep this window open")
    print("  [!] Press Ctrl+C to stop\n")
    print("=" * 70 + "\n")
    
    # Start browser
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Run Flask
    try:
        app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print("\n  Shutting down server...")
        print("  Server stopped successfully!\n")
        print("  Thank you for using Zawiya Electronic School\n")
        print("=" * 70 + "\n")
