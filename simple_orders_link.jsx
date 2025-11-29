<!-- صفحة طلبات بسيطة HTML + CSS + JS بدون React -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>قائمة الطلبات</title>
  <style>
    body { font-family: sans-serif; background: #f3f3f3; margin: 0; padding: 20px; }
    .container { max-width: 1100px; margin: auto; display: grid; grid-template-columns: 250px 1fr; gap: 20px; }
    .sidebar { background: #fff; padding: 15px; border-radius: 15px; box-shadow: 0 0 5px #ccc; }
    .orders { background: #fff; padding: 15px; border-radius: 15px; box-shadow: 0 0 5px #ccc; }
    .order-card { background: #fff; padding: 10px; border-radius: 12px; box-shadow: 0 0 4px #ccc; margin-bottom: 15px; }
    .order-img { width: 100%; height: 180px; background: #eee; border-radius: 10px; object-fit: cover; }
    .btn { padding: 8px 12px; border-radius: 8px; cursor: pointer; border: none; }
    .btn-blue { background: #1e88e5; color: #fff; }
    .btn-red { background: #e53935; color: #fff; }
    .btn-gray { background: #eee; }
    /* المودال */
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; }
    .modal.show { display: flex; }
    .modal-box { background:#fff; padding:20px; width:100%; max-width:400px; border-radius:12px; }
  </style>
</head>
<body>

<div class="container">
  <!-- الشريط الجانبي -->
  <div class="sidebar">
    <h3>المشرفين</h3>
    <p>اسم المشرف: مشرف التجربة</p>
    <p>الكود: 010100</p>
    <button class="btn btn-blue" onclick="openForm()">إضافة طلب</button>
    <button class="btn btn-gray" onclick="resetData()">إعادة ضبط</button>
    <p style="font-size:12px;margin-top:10px;color:#777">لا توجد معاملات مالية في هذه الصفحة.</p>
  </div>

  <!-- قائمة الطلبات -->
  <div class="orders">
    <h2>قائمة الطلبات</h2>
    <div id="ordersList"></div>
  </div>
</div>

<!-- نافذة إضافة/تعديل الطلب -->
<div class="modal" id="formModal">
  <div class="modal-box">
    <h3 id="formTitle">إضافة طلب</h3>

    <label>اسم الطلب</label>
    <input id="titleInput" class="input" style="width:100%;padding:8px" />

    <br><br>
    <label>رقم الديلفري</label>
    <input id="deliveryInput" class="input" style="width:100%;padding:8px" />

    <br><br>
    <label>صورة الطلب</label>
    <input type="file" accept="image/*" onchange="loadImage(event)" />

    <img id="previewImg" style="width:100%; margin-top:10px; display:none; border-radius:10px" />

    <br><br>
    <button class="btn btn-blue" onclick="saveOrder()">حفظ</button>
    <button class="btn btn-gray" onclick="closeForm()">إلغاء</button>
  </div>
</div>

<script>
  let orders = JSON.parse(localStorage.getItem("simple_orders_html")) || [];
  let editingId = null;
  let imageData = "";

  function render() {
    const list = document.getElementById("ordersList");
    list.innerHTML = "";

    if (orders.length === 0) {
      list.innerHTML = `<p style='text-align:center;color:#777'>لا توجد طلبات حالياً</p>`;
      return;
    }

    orders.forEach(o => {
      list.innerHTML += `
        <div class='order-card'>
          <img class='order-img' src='${o.image || ""}' alt='img' />
          <h3>${o.title}</h3>
          <p>رقم الديلفري: <b>${o.delivery}</b></p>
          <button class='btn btn-gray' onclick='editOrder(${o.id})'>تعديل</button>
          <button class='btn btn-red' onclick='deleteOrder(${o.id})'>حذف</button>
        </div>
      `;
    });
  }

  function openForm() {
    editingId = null;
    imageData = "";
    document.getElementById("formTitle").innerText = "إضافة طلب";
    document.getElementById("titleInput").value = "";
    document.getElementById("deliveryInput").value = "";
    document.getElementById("previewImg").style.display = "none";
    document.getElementById("formModal").classList.add("show");
  }

  function closeForm() {
    document.getElementById("formModal").classList.remove("show");
  }

  function loadImage(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      imageData = reader.result;
      const preview = document.getElementById("previewImg");
      preview.src = imageData;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  function saveOrder() {
    const title = document.getElementById("titleInput").value.trim();
    const delivery = document.getElementById("deliveryInput").value.trim();

    if (!title || !delivery) return alert("من فضلك املأ كل البيانات");

    if (editingId) {
      const idx = orders.findIndex(o => o.id === editingId);
      orders[idx].title = title;
      orders[idx].delivery = delivery;
      if (imageData) orders[idx].image = imageData;
    } else {
      orders.unshift({ id: Date.now(), title, delivery, image: imageData });
    }

    localStorage.setItem("simple_orders_html", JSON.stringify(orders));
    closeForm();
    render();
  }

  function editOrder(id) {
    const o = orders.find(x => x.id === id);
    editingId = id;
    imageData = o.image;

    document.getElementById("formTitle").innerText = "تعديل الطلب";
    document.getElementById("titleInput").value = o.title;
    document.getElementById("deliveryInput").value = o.delivery;

    const preview = document.getElementById("previewImg");
    if (o.image) { preview.src = o.image; preview.style.display = "block"; }

    document.getElementById("formModal").classList.add("show");
  }

  function deleteOrder(id) {
    if (!confirm("هل تريد حذف الطلب؟")) return;
    orders = orders.filter(o => o.id !== id);
    localStorage.setItem("simple_orders_html", JSON.stringify(orders));
    render();
  }

  function resetData() {
    localStorage.removeItem("simple_orders_html");
    orders = [];
    render();
  }

  render();
</script>

</body>
</html>
