const { createApp, ref, computed, onMounted, watch } = Vue;

const app = createApp({
    setup() {
        const getElementClass = (char) => {
            const element = wuXing[char] || '';
            const map = {
                '木': 'text-wood',
                '火': 'text-fire',
                '土': 'text-earth',
                '金': 'text-metal',
                '水': 'text-water'
            };
            return map[element] || '';
        };
        const personInfo = ref({
            name: 'XXX',
            gender: '男',
            lunar: '',
            solar: '',
            zodiac: ''
        });

        const bazi = ref({
            names: ['年柱', '月柱', '日柱', '时柱'],//柱名
            mainStars: [],//主星
            heavenlyStems: [],///天干
            earthlyBranches: [],//地支
            hiddenStemsList: [],//隐藏天干
            auxiliaryStarsList: [],//辅助星
            starLucks: [],//星运
            selfSits: [],//自坐
            emptyDeaths: [],//空亡
            nayins: [],//纳音
            divineEvilsList: [],//神煞
        });
        const selectedYear = ref(1994);
        const selectedMonth = ref(11);
        const selectedDay = ref(28);
        const selectedHour = ref(21);
        const selectedMinute = ref(49);
        const showPicker = ref(false);


        const years = [...Array(200).keys()].map(i => i + 1900);
        const months = [...Array(12).keys()].map(i => i + 1);
        const days = ref([...Array(30).keys()].map(i => i + 1));
        const hours = [...Array(24).keys()];
        const minutes = [...Array(60).keys()];
        const dayun = ref({
            qiyun: '',
            qiyunDate: '',
            qiyunYear: [],
            qiyunEga: [],
            qiyunGanZhi:[],
            qiyunTenGods:[]
        });
        const liunian = ref({year:[],age:[],ganZhi:[],tenGods:[]});
        const liuyue = ref({year:[],age:[],ganZhi:[],tenGods:[]});
        const liuri = ref({year:[],ganZhi:[],tenGods:[]});
        
        // 选择变量
        const selectedDayunIndex = ref(0); // 大运选中索引
        const selectedLiunianIndex = ref(0); // 流年选中索引
        const selectedLiuyueIndex = ref(0); // 流月选中索引
        const selectedLiuriIndex = ref(0); // 流日选中索引

        const rz = ref('');
        const getdTenGods = (g) => {
            return dTenGods[TEN_GODS[rz.value][tianGan.indexOf(dztotg[g])]];
        };
        /**
         * 计算
         */
        const confirmDate = () => {
            showPicker.value = false;
            const date =new Date(
                selectedYear.value,
                selectedMonth.value-1,
                selectedDay.value,
                selectedHour.value,
                selectedMinute.value
            );
            // 计算八字
            let baziResult = calculateBazi(date);
            personInfo.value.lunar =  solarToLunar(date) + ' '+ baziResult[1][2] + '时 ' + (personInfo.value.gender === '男' ? ' 乾造' : ' 坤造');
            personInfo.value.solar = date.toLocaleString();
            personInfo.value.zodiac = Object.values(shenxiaoemail)[(personInfo.value.lunar.substring(0,4)+2) % 12];

            const tg = baziResult[0];//天干
            const dz = baziResult[1];//地支
            rz.value = tg[2]; 
            dayun.value = calculateDayun(date,baziResult[0][0],baziResult[0][1]+baziResult[1][1],personInfo.value.gender,baziResult[2],baziResult[3]);
            dayun.value.qiyunTenGods = [...dayun.value.qiyunGanZhi.map(item => getdTenGods(item[0])+getdTenGods(item[1]))];
            bazi.value.heavenlyStems = tg;//天干
            bazi.value.earthlyBranches = dz;//地支
            for (let i = 0; i < 4; i++) {
                bazi.value.mainStars[i] = TEN_GODS[tg[2]][tianGan.indexOf(tg[i])];//主星
                bazi.value.hiddenStemsList[i] = HIDDEN_STEMS_TABLE[dz[i]].split('');//隐藏天干
                bazi.value.auxiliaryStarsList[i] = bazi.value.hiddenStemsList[i].map(item => TEN_GODS[tg[2]][tianGan.indexOf(item)]);//辅助星
                bazi.value.starLucks[i] = LONGEVITY_TABLE[tg[2]][diZhi.indexOf(dz[i])];//星运
                bazi.value.selfSits[i] = LONGEVITY_TABLE[tg[i]][diZhi.indexOf(dz[i])];//自坐
                bazi.value.emptyDeaths[i] = VOID_TABLE[tg[i]+dz[i]];//空亡
                bazi.value.nayins[i] =NAYIN_TABLE[tg[i]+dz[i]];//纳音
                bazi.value.divineEvilsList = [];//神煞
            }
            
        };

        const handleWheelScroll = (type, event) => {
            // 获取滚动条滚动的位置
            const value = Math.floor(event.target.scrollTop / 35);
            switch (type) {
                case 'year':
                    selectedYear.value = years[value];
                    break;
                case 'month':
                    selectedMonth.value = months[value];
                    break;
                case 'day':
                    selectedDay.value = days.value[value];
                    break;
                case 'hour':
                    selectedHour.value = hours[value];
                    break;
                case 'minute':
                    selectedMinute.value = minutes[value];
                    break;
            }
        };

        const scrollToToday = () => {
            // 获取当前日期
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1; // 月份从0开始，需要+1
            const day = today.getDate();
            const hour = today.getHours();
            const minute = today.getMinutes();
            // 更新选中值
            selectedYear.value = year;
            selectedMonth.value = month;
            selectedDay.value = day;
            selectedHour.value = hour;
            selectedMinute.value = minute;
            const pickerWheels = document.querySelectorAll('.picker-wheel');
            if (pickerWheels.length >= 5) {
                pickerWheels[0].scrollTop = (year - 1900) * 35;
                pickerWheels[1].scrollTop = (month - 1) * 35;
                pickerWheels[2].scrollTop = (day - 1) * 35;
                pickerWheels[3].scrollTop = (hour) * 35;
                pickerWheels[4].scrollTop = (minute) * 35;
            }
        };

        watch([selectedYear, selectedMonth], ([year, month]) => {
            days.value = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => 1 + i);
        });
        watch(showPicker, (newValue) => {
            // 日期选择器显示时的逻辑
            if (newValue) {
                // 延迟执行，确保DOM已经更新
                setTimeout(() => {
                    // 初始化滚动条位置
                    const pickerWheels = document.querySelectorAll('.picker-wheel');
                    if (pickerWheels.length >= 5) {
                        pickerWheels[0].scrollTop =  (selectedYear.value - 1900) * 35;
                        pickerWheels[1].scrollTop =  (selectedMonth.value - 1) * 35;
                        pickerWheels[2].scrollTop =  (selectedDay.value - 1) * 35;
                        pickerWheels[3].scrollTop =  (selectedHour.value) * 35;
                        pickerWheels[4].scrollTop =  (selectedMinute.value) * 35;
                    }
                }, 200);
            }
        });

        const yuefeng = [2,3,4,5,6,7,8,9,10,11,12,1];
        const selectLuck = (index, type) => {
            switch (type) {
                case '大运':
                    selectedDayunIndex.value = index;
                    for (let i = 0; i < 10; i++) {
                        liunian.value.year[i] = i + index;
                        liunian.value.age[i] = i + index - selectedYear.value;
                        liunian.value.ganZhi[i] = jiazi[(i+index-4) % 60];
                        liunian.value.tenGods[i] = getdTenGods(liunian.value.ganZhi[i][0]) + getdTenGods(liunian.value.ganZhi[i][1]);
                    }
                    break;
                case '流年':
                    selectedLiunianIndex.value = index;
                    for (let i = 0; i < 12; i++) {
                        liuyue.value.year[i] = jieQi[i * 2];
                        liuyue.value.age[i] = yuefeng[i] + '/' + jieQidate[(index-1900)*24+2+i*2].substring(1,2);
                        liuyue.value.ganZhi[i] = jiazi[(index*12+i+14) % 60];
                        liuyue.value.tenGods[i] = getdTenGods(liuyue.value.ganZhi[i][0]) + getdTenGods(liuyue.value.ganZhi[i][1]);
                    }
                    break;
                case '流月':
                    selectedLiuyueIndex.value = index;
                    let sjq = new Date(selectedLiunianIndex.value + '/' + liuyue.value.age[index]);
                    let xjq = new Date(selectedLiunianIndex.value+1,1,jieQidate[(selectedLiunianIndex.value+1-1900)*24+2].substring(1,2));
                    index !== 11 && (xjq = new Date(selectedLiunianIndex.value + '/' + liuyue.value.age[index+1]));
                    let yuecha = (xjq - sjq) / (1000 * 60 * 60 * 24);
                    liuri.value.year=[];
                    for (let i = 0; i < yuecha; i++) {
                        liuri.value.year[i] = `${ sjq.getMonth()+1 }/${ sjq.getDate() }`;
                        liuri.value.ganZhi[i] = jiazi[Math.floor( sjq / 86400000+18) % 60];
                        liuri.value.tenGods[i] = getdTenGods(liuri.value.ganZhi[i][0]) + getdTenGods(liuri.value.ganZhi[i][1]);
                        sjq.setDate(sjq.getDate()+1);
                    }
                    break;
                case '流日':
                    selectedLiuriIndex.value = index;
                    break;
            }
        };
        // 页面加载时执行一次confirmDate
        onMounted(() => {
            confirmDate();
        });

        return {
            personInfo,
            bazi,
            wuXing,
            showPicker,
            years,
            months,
            days,
            hours,
            minutes,
            selectedYear,
            selectedMonth,
            selectedDay,
            selectedHour,
            selectedMinute,
            dayun,
            liunian,
            liuyue,
            liuri,
            selectedDayunIndex,
            selectedLiunianIndex,
            selectedLiuyueIndex,
            selectedLiuriIndex,
            getElementClass,
            handleWheelScroll,
            confirmDate,
            scrollToToday,
            selectLuck
        };
    }
});

app.mount('#app');
