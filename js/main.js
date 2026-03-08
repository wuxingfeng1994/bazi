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
            name: '吴兴锋',
            lunar: '1994年十月廿六 亥时 乾造',
            solar: '1994年11月28日 21:49:33',
            zodiac: '🐶'
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
            divineEvilsList: []//神煞
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

        /**
         * 计算
         */
        const confirmDate = () => {
            showPicker.value = false;
            const date = {
                year: selectedYear.value,
                month: selectedMonth.value,
                day: selectedDay.value,
                hour: selectedHour.value
            };
            // 正确修改bazi中的mainStars
            
            console.log('计算八字，日期:', date);
            //模拟数据
            const tg = ['甲', '乙', '戊','癸'];///天干
            const dz = ['戌', '亥', '午', '亥'];//地支

            bazi.value.heavenlyStems = tg///天干
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
            getElementClass,
            handleWheelScroll,
            confirmDate,
            scrollToToday,
        };
    }
});

app.mount('#app');
