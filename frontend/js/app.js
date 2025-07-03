
/* item_introduction_website/frontend/js/app.js */

/**
 * 物品百科 - 主应用逻辑
 * 实现分类筛选、图片轮播、收藏功能和简单搜索
 */

// 确保DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 应用状态管理
    const appState = {
        currentCategory: 'all',
        favorites: JSON.parse(localStorage.getItem('favorites')) || [],
        itemsData: [], // 将从API获取或使用内联数据
        publicItemsData: [], // 公共分享物品数据
        carouselIntervals: [], // 存储所有轮播计时器
        uploadedImages: [], // 存储上传的图片
        darkMode: localStorage.getItem('darkMode') === 'true' || false // 主题设置
    };

    // DOM元素引用
    const elements = {
        itemsContainer: document.getElementById('itemsContainer'),
        publicItemsContainer: document.getElementById('publicItemsContainer'),
        categoryButtons: document.querySelectorAll('.category-btn'),
        searchInput: document.getElementById('searchInput'),
        noResultsElement: document.getElementById('noResults'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        favoritesBtn: document.getElementById('favoritesBtn'),
        favoritesPanel: document.getElementById('favoritesPanel'),
        overlay: document.getElementById('overlay'),
        closePanel: document.getElementById('closePanel'),
        favoritesList: document.getElementById('favoritesList'),
        emptyFavorites: document.getElementById('emptyFavorites'),
        uploadArea: document.getElementById('uploadArea'),
        fileInput: document.getElementById('fileInput'),
        previewContainer: document.getElementById('previewContainer'),
        itemName: document.getElementById('itemName'),
        itemCategory: document.getElementById('itemCategory'),
        itemDescription: document.getElementById('itemDescription'),
        submitItem: document.getElementById('submitItem'),
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        themeIcon: document.getElementById('themeIcon'),
        themeText: document.getElementById('themeText')
    };

    // 测试物品数据
    const itemsData = [
        {
            id: 1,
            name: '免费Mac笔记本电脑',
            category: 'electronics',
            description: '2019款MacBook Pro，状态良好，因为升级了新电脑所以免费送出。8GB内存，256GB SSD存储，电池健康度90%以上。',
            images: ['https://picsum.photos/id/119/800/600', 'https://picsum.photos/id/180/800/600'],
            price: '免费'
        },
        {
            id: 2,
            name: '实木餐桌套装',
            category: 'furniture',
            description: '一张实木餐桌和四把椅子，使用了两年，状态良好。适合小户型家庭。',
            images: ['https://picsum.photos/id/292/800/600', 'https://picsum.photos/id/633/800/600', 'https://picsum.photos/id/118/800/600'],
            price: '免费'
        },
        {
            id: 3,
            name: '儿童自行车',
            category: 'sports',
            description: '适合5-8岁儿童使用的自行车，我家孩子已经长大不用了，车况良好，有少许使用痕迹。',
            images: ['https://picsum.photos/id/146/800/600'],
            price: '免费'
        },
        {
            id: 4,
            name: '冬季外套',
            category: 'clothing',
            description: '男士M码冬季外套，穿过几次，状态良好，适合170-175cm身高的人穿着。',
            images: ['https://picsum.photos/id/823/800/600', 'https://picsum.photos/id/883/800/600'],
            price: '免费'
        },
        {
            id: 5,
            name: '厨房搅拌机',
            category: 'kitchen',
            description: '功率强劲的厨房搅拌机，适合做蛋糕和面包，因为购买了新款所以免费送出。',
            images: ['https://picsum.photos/id/425/800/600', 'https://picsum.photos/id/519/800/600'],
            price: '免费'
        },
        {
            id: 6,
            name: '40英寸液晶电视',
            category: 'electronics',
            description: '三星40英寸液晶电视，画面清晰，没有坏点，赠送原装遥控器。',
            images: ['https://picsum.photos/id/401/800/600'],
            price: '免费'
        },
        {
            id: 7,
            name: '书架',
            category: 'furniture',
            description: '宜家风格书架，组装简单，可以放很多书和装饰品，状态良好。',
            images: ['https://picsum.photos/id/240/800/600', 'https://picsum.photos/id/530/800/600'],
            price: '免费'
        },
        {
            id: 8,
            name: '瑜伽垫',
            category: 'sports',
            description: '10mm厚度瑜伽垫，防滑，适合初学者和专业人士。用过几次，已消毒清洁。',
            images: ['https://picsum.photos/id/416/800/600'],
            price: '免费'
        }
    ];

    // 初始化应用
    function initApp() {
        // 初始化主题
        initTheme();
        
        // 使用内联数据
        appState.itemsData = itemsData;
        loadPublicItems(); // 加载公共分享数据
        setupEventListeners();
        renderItems();
        updateFavoritesList();
        initParticles();
        setupUploadArea();
    }

    // 初始化主题设置
    function initTheme() {
        if (appState.darkMode) {
            document.documentElement.classList.add('dark-theme');
            elements.themeIcon.className = 'fas fa-moon mr-2';
            elements.themeText.textContent = '切换亮色';
        } else {
            document.documentElement.classList.remove('dark-theme');
            elements.themeIcon.className = 'fas fa-sun mr-2';
            elements.themeText.textContent = '切换暗色';
        }
        
        // 设置主题切换按钮点击事件
        elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // 切换主题
    function toggleTheme() {
        appState.darkMode = !appState.darkMode;
        
        // 保存到本地存储
        localStorage.setItem('darkMode', appState.darkMode);
        
        // 更新UI
        if (appState.darkMode) {
            document.documentElement.classList.add('dark-theme');
            elements.themeIcon.className = 'fas fa-moon mr-2';
            elements.themeText.textContent = '切换亮色';
        } else {
            document.documentElement.classList.remove('dark-theme');
            elements.themeIcon.className = 'fas fa-sun mr-2';
            elements.themeText.textContent = '切换暗色';
        }
        
        showToast(appState.darkMode ? '已切换到暗色主题' : '已切换到亮色主题');
    }

    // 加载公共分享物品数据
    function loadPublicItems() {
        // 模拟从API获取公共分享数据
        appState.publicItemsData = [
            {
                id: 1001,
                name: '二手笔记本电脑',
                category: 'electronics',
                description: '功能完好的二手笔记本，适合办公学习使用',
                images: ['https://picsum.photos/id/1/400/300', 'https://picsum.photos/id/201/400/300'],
                price: '免费',
                user: {
                    name: '张先生',
                    avatar: 'https://picsum.photos/id/1005/100/100',
                    time: '2025-05-27'
                }
            },
            {
                id: 1002,
                name: '实木书架',
                category: 'furniture',
                description: '八成新实木书架，高度1.8米，宽度0.8米',
                images: ['https://picsum.photos/id/225/400/300'],
                price: '免费',
                user: {
                    name: '李女士',
                    avatar: 'https://picsum.photos/id/1011/100/100',
                    time: '2025-05-26'
                }
            },
            {
                id: 1003,
                name: '冬季羽绒服',
                category: 'clothing',
                description: '保暖性能良好的羽绒服，尺码L',
                images: ['https://picsum.photos/id/103/400/300', 'https://picsum.photos/id/104/400/300'],
                price: '免费',
                user: {
                    name: '王同学',
                    avatar: 'https://picsum.photos/id/1012/100/100',
                    time: '2025-05-25'
                }
            }
        ];

        renderPublicItems();
    }

    // 渲染公共分享物品
    function renderPublicItems() {
        elements.publicItemsContainer.innerHTML = appState.publicItemsData.map(item => {
            const isFavorite = appState.favorites.includes(item.id);
            
            return `
            <div class="public-item-card rounded-lg shadow-md overflow-hidden">
                <div class="carousel-container">
                    <div class="carousel-images" id="public-carousel-${item.id}">
                        ${item.images.map(img => 
                            `<img src="${img}" alt="${item.name}" loading="lazy">`
                        ).join('')}
                    </div>
                    ${item.images.length > 1 ? `
                    <div class="carousel-btn prev" data-id="public-${item.id}">
                        <i class="fas fa-chevron-left"></i>
                    </div>
                    <div class="carousel-btn next" data-id="public-${item.id}">
                        <i class="fas fa-chevron-right"></i>
                    </div>` : ''}
                </div>
                <div class="p-4">
                    <div class="user-info">
                        <img src="${item.user.avatar}" alt="${item.user.name}" class="user-avatar">
                        <div>
                            <p class="username">${item.user.name}</p>
                            <p class="share-time">${item.user.time}</p>
                        </div>
                    </div>
                    <div class="flex justify-between items-start mt-2">
                        <h3 class="text-lg font-semibold">${item.name}</h3>
                        <span class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${item.id}">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart text-xl"></i>
                        </span>
                    </div>
                    <div class="mt-2">
                        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                            ${getCategoryName(item.category)}
                        </span>
                        <span class="free-tag inline-block rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2">
                            ${item.price}
                        </span>
                    </div>
                    <p class="mt-2 line-clamp-2">${item.description}</p>
                </div>
            </div>`;
        }).join('');

        // 设置公共分享物品的轮播和收藏按钮
        setupCarousels();
        setupFavoriteButtons();
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 分类按钮点击事件
        elements.categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 移除所有按钮的active类
                elements.categoryButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 为当前点击的按钮添加active类
                e.currentTarget.classList.add('active');
                
                // 更新当前类别并重新渲染
                appState.currentCategory = e.currentTarget.dataset.category;
                renderItems();
            });
        });
        
        // 搜索输入事件
        elements.searchInput.addEventListener('input', debounce(renderItems, 300));
        
        // 收藏面板相关事件
        elements.favoritesBtn.addEventListener('click', toggleFavoritesPanel);
        elements.closePanel.addEventListener('click', toggleFavoritesPanel);
        elements.overlay.addEventListener('click', toggleFavoritesPanel);

        // 监听窗口大小变化，调整布局
        window.addEventListener('resize', handleResize);
    }

    // 渲染物品列表
    function renderItems() {
        const searchTerm = elements.searchInput.value.toLowerCase();
        const filteredItems = appState.itemsData.filter(item => {
            const matchesCategory = appState.currentCategory === 'all' || item.category === appState.currentCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                                item.description.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        if (filteredItems.length === 0) {
            elements.noResultsElement.style.display = 'block';
            elements.itemsContainer.style.display = 'none';
        } else {
            elements.noResultsElement.style.display = 'none';
            elements.itemsContainer.style.display = 'grid';
            elements.itemsContainer.innerHTML = filteredItems.map(createItemCardHTML).join('');
            setupCarousels();
            setupFavoriteButtons();
        }
    }

    // 创建物品卡片HTML
    function createItemCardHTML(item) {
        const isFavorite = appState.favorites.includes(item.id);
        
        return `
        <div class="item-card rounded-lg shadow-md overflow-hidden">
            <div class="carousel-container">
                <div class="carousel-images" id="carousel-${item.id}">
                    ${item.images.map(img => 
                        `<img src="${img}" alt="${item.name}" loading="lazy">`
                    ).join('')}
                </div>
                ${item.images.length > 1 ? `
                <div class="carousel-btn prev" data-id="${item.id}">
                    <i class="fas fa-chevron-left"></i>
                </div>
                <div class="carousel-btn next" data-id="${item.id}">
                    <i class="fas fa-chevron-right"></i>
                </div>` : ''}
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-semibold">${item.name}</h3>
                    <span class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${item.id}">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart text-xl"></i>
                    </span>
                </div>
                <div class="mt-2">
                    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                        ${getCategoryName(item.category)}
                    </span>
                    <span class="free-tag inline-block rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2">
                        ${item.price}
                    </span>
                </div>
                <p class="mt-2 line-clamp-2">${item.description}</p>
            </div>
        </div>`;
    }

    // 设置轮播图功能
    function setupCarousels() {
        // 清除所有现有的轮播计时器
        clearAllCarouselIntervals();
        
        // 为每个物品设置轮播
        document.querySelectorAll('.carousel-container').forEach(container => {
            const carouselId = container.querySelector('.carousel-images').id;
            const carousel = container.querySelector('.carousel-images');
            const images = carousel.querySelectorAll('img');
            const prevBtn = container.querySelector('.prev');
            const nextBtn = container.querySelector('.next');
            
            let currentIndex = 0;
            const totalImages = images.length;
            
            if (totalImages <= 1) {
                return;
            }
            
            // 自动轮播函数
            const startCarousel = () => {
                return setInterval(() => {
                    currentIndex = (currentIndex + 1) % totalImages;
                    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                }, 3000);
            };
            
            // 启动轮播
            const intervalId = startCarousel();
            appState.carouselIntervals.push(intervalId);
            
            // 鼠标悬停暂停轮播
            container.addEventListener('mouseenter', () => {
                clearInterval(intervalId);
            });
            
            // 鼠标离开恢复轮播
            container.addEventListener('mouseleave', () => {
                const newIntervalId = startCarousel();
                appState.carouselIntervals.push(newIntervalId);
            });
            
            if (prevBtn && nextBtn) {
                // 上一张按钮
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
                    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                });
                
                // 下一张按钮
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % totalImages;
                    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                });
            }
        });
    }

    // 清除所有轮播计时器
    function clearAllCarouselIntervals() {
        appState.carouselIntervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        appState.carouselIntervals = [];
    }

    // 设置收藏按钮功能
    function setupFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = parseInt(button.dataset.id);
                toggleFavorite(itemId);
            });
        });
    }

    // 切换收藏状态
    function toggleFavorite(itemId) {
        const index = appState.favorites.indexOf(itemId);
        
        if (index === -1) {
            // 添加到收藏
            appState.favorites.push(itemId);
            showToast('已添加到收藏夹');
        } else {
            // 从收藏中移除
            appState.favorites.splice(index, 1);
            showToast('已从收藏夹移除');
        }
        
        // 更新本地存储
        localStorage.setItem('favorites', JSON.stringify(appState.favorites));
        
        // 更新UI
        updateFavoritesList();
        renderItems();
        renderPublicItems();
    }

    // 更新收藏列表
    function updateFavoritesList() {
        if (appState.favorites.length === 0) {
            elements.emptyFavorites.style.display = 'block';
            elements.favoritesList.style.display = 'none';
            return;
        }
        
        elements.emptyFavorites.style.display = 'none';
        elements.favoritesList.style.display = 'block';
        
        const allItems = [...appState.itemsData, ...appState.publicItemsData];
        const favoriteItems = allItems.filter(item => 
            appState.favorites.includes(item.id)
        );
        
        elements.favoritesList.innerHTML = favoriteItems.map(item => `
            <div class="favorite-item rounded-lg shadow-sm p-4 flex items-center" style="background: var(--card-bg); border: 1px solid var(--border-color);">
                <img src="${item.images[0]}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
                <div class="ml-4 flex-1">
                    <h3 class="font-medium">${item.name}</h3>
                    <p class="text-sm opacity-70">${getCategoryName(item.category)}</p>
                </div>
                <button class="remove-favorite-btn text-red-500 hover:text-red-700" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // 为移除按钮添加事件监听器
        document.querySelectorAll('.remove-favorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = parseInt(button.dataset.id);
                toggleFavorite(itemId);
            });
        });
    }

    // 切换收藏面板显示/隐藏
    function toggleFavoritesPanel() {
        elements.favoritesPanel.classList.toggle('show');
        elements.overlay.classList.toggle('show');
        document.body.classList.toggle('overflow-hidden');
    }

    // 显示提示消息
    function showToast(message) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.add('show');
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }

    // 获取分类名称
    function getCategoryName(categoryKey) {
        const categories = {
            'electronics': '电子产品',
            'furniture': '家具',
            'clothing': '服装',
            'kitchen': '厨房用品',
            'sports': '运动器材'
        };
        return categories[categoryKey] || categoryKey;
    }

    // 处理窗口大小变化
    function handleResize() {
        // 可以根据需要添加响应式调整逻辑
    }

    // 初始化粒子效果
    function initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 60, density: { enable: true, value_area: 800 } },
                    color: { value: appState.darkMode ? "#ffffff" : "#667eea" },
                    shape: { type: "circle" },
                    opacity: { value: 0.4, random: true },
                    size: { value: 3, random: true },
                    line_linked: { 
                        enable: true, 
                        distance: 150, 
                        color: appState.darkMode ? "#ffffff" : "#667eea", 
                        opacity: 0.3, 
                        width: 1 
                    },
                    move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out" }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "repulse" },
                        onclick: { enable: true, mode: "push" }
                    }
                }
            });
        }
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // 设置上传区域功能
    function setupUploadArea() {
        // 点击上传区域触发文件选择
        elements.uploadArea.addEventListener('click', () => {
            elements.fileInput.click();
        });

        // 拖拽上传
        elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.add('active');
        });

        elements.uploadArea.addEventListener('dragleave', () => {
            elements.uploadArea.classList.remove('active');
        });

        elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.remove('active');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files);
            }
        });

        // 文件选择变化
        elements.fileInput.addEventListener('change', () => {
            if (elements.fileInput.files.length > 0) {
                handleFileUpload(elements.fileInput.files);
            }
        });

        // 提交物品
        elements.submitItem.addEventListener('click', () => {
            if (appState.uploadedImages.length === 0) {
                showToast('请上传至少一张物品图片');
                return;
            }

            if (!elements.itemName.value.trim()) {
                showToast('请输入物品名称');
                return;
            }

            // 模拟提交成功
            showToast('物品分享成功，正在审核中');
            elements.itemName.value = '';
            elements.itemDescription.value = '';
            elements.previewContainer.innerHTML = '';
            appState.uploadedImages = [];
        });
    }

    // 处理文件上传
    function handleFileUpload(files) {
        if (files.length + appState.uploadedImages.length > 5) {
            showToast('最多只能上传5张图片');
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image';
                
                const container = document.createElement('div');
                container.className = 'relative inline-block';
                container.appendChild(img);
                
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.className = 'absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs';
                removeBtn.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    const index = appState.uploadedImages.indexOf(e.target.result);
                    if (index !== -1) {
                        appState.uploadedImages.splice(index, 1);
                    }
                    container.remove();
                });
                container.appendChild(removeBtn);
                
                elements.previewContainer.appendChild(container);
                appState.uploadedImages.push(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // 启动应用
    initApp();
});
