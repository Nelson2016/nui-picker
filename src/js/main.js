/*
 * Javascript Document
 *
 * Creat by Nelson 2017/8/2
 * 
 * Website : http://www.nelson_obj.com
 * 
 * QQ : 616859570
 *
 * Email : Nelson_Lee@outlook.com
 * */


import NuiPicker from './nui-data-picker';

new NuiPicker([
    {data: ['提前一个月', '提前一周', '提前三天', '提前一天', '体检当天']},
    {data: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], title: '时'},
    {data: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], title: '分'}
], {
    confirmCallback: function () {
        console.log('-----------')
    }
});