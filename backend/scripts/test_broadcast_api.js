async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/admin/broadcast-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'toiyeutinhoc238@gmail.com'
      },
      body: JSON.stringify({
        subject: 'Thông báo toàn trường',
        headline: 'Thông báo thử nghiệm',
        message: 'Nội dung thông báo toàn trường.',
        target: 'all'
      })
    });

    const data = await res.json();
    console.log('API Response (Target all):', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
