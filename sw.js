//daftar file yang akan di cache
var	filesToCache	=	[
  '/',
  'style/main.css',
  'images/still_life_medium.jpg',
  'index.html',
  'pages/offline.html',
  'pages/404.html'
];

//proses installasi service worker
var	staticCacheName	=	'pages-cache-v2';
self.addEventListener('install',	function(event)	{
		console.log('Attempting	to	install	service	worker	and	cache	static	assets');
		event.waitUntil(
				caches.open(staticCacheName)
				.then(function(cache)	{
						return	cache.addAll(filesToCache);
				})
		);
});

//Mencoba untuk menyocokkan permintaan dengan konten cache. 
self.addEventListener('fetch', event => {
	console.log('Fetch event for ', event.request.url);
	event.respondWith(
		caches.match(event.request)
		.then(response => {
			//Jika sumber daya terdapat di cache, maka akan ditampilkan pada console "found ... in cache".
			if (response) {
				console.log('Found ', event.request.url, ' in cache');
				return response;
			}
			//Jika data tidak ditemukan maka akan ditampilkan pada console "Network request for..." dan akan dibuka halaman 404 
			console.log('Network request for ', event.request.url);
			return fetch(event.request)
			.then(response => {
			if (response.status === 404) {
				return caches.match('pages/404.html');
			}
			return caches.open(staticCacheName)
			.then(cache => {
				cache.put(event.request.url, response.clone());
				return response;
			});
		});
	//Jika tidak ada koneksi internet makan akan dibuka halaman offline yang telah dicustom
    }).catch(error => {
      console.log('Error, ', error);
      return caches.match('pages/offline.html');
    })
  );
});

//menghapus cache yang outdated / lama 
self.addEventListener('activate',	function(event)	{
	console.log('Activating	new	service	worker...');
	var	cacheWhitelist	=	[staticCacheName];
	event.waitUntil(
			caches.keys().then(function(cacheNames)	{
					return	Promise.all(
							cacheNames.map(function(cacheName)	{
									if	(cacheWhitelist.indexOf(cacheName)	===	-1)	{
											return	caches.delete(cacheName);
									}
							})
					);
			})
	);
});