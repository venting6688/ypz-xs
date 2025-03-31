<template>
	<view class="department">
		<HeaderBar :HeaderBar="HeaderBar" />
		<van-search
		    v-model="searchQuery"
		    placeholder="搜索科室"
		    @change="onSearchChange"
		/>
		<van-tree-select
		      height="880rpx"
		      :items="filteredItems"
		      :main-active-index.sync="mainActiveIndex"
		      :active-id.sync="activeId"
		      @click-nav="onNavClick"
		      @click-item="onItemClick"
		    />
	</view>
</template>

<script>
	import HeaderBar from '@/components/HeaderBar.vue';
	import registrationApi from '@/api/registrationApi.js'
	export default {
		components:{
			HeaderBar
		},
	    data() {
	        return {
				HeaderBar:{
					title:'预约挂号',
					state:true,
				},
	            searchQuery: '',
				items:[],
	            filteredItems: [],
				stairDepartment:[],     //一级科室
				secondDepartment:[],     //二级科室
	            activeId: null,
	            mainActiveIndex: 0
	        };
	    },
		onShow() {
			this.getServiceGroup()
		},
	    methods: {
		    onSearchChange(value) {
					this.searchQuery = value.detail
					this.filterItemsFun();
				},
			// 获取大科室
			getServiceGroup() {
			  		registrationApi.getServiceGroup().then(res => {
						if(res.data.code===200) {
							this.stairDepartment = res.data.data.ClinicServiceGroup.map(item =>({text:item.CliSerGroupName,...item}));
							if(this.stairDepartment.length){
								let CliSerGroupID = this.stairDepartment[this.mainActiveIndex].CliSerGroupID
								this.getSpecialtyGroup(CliSerGroupID)
							}
							
						}
			  		})
			  		.catch(err => {
			  			console.log('errrrrr：', err);
			  		})
			  },
			  // 获取小科室
			getSpecialtyGroup(CliSerGroupID) {
				registrationApi.getSpecialtyGroup(CliSerGroupID).then(res => {
       					if(Array.isArray(res.data.data.ClinicGroup)){
						    this.secondDepartment = res.data.data.ClinicGroup.map(item =>({text:item.CLGRPDesc,...item}));
					    }else {
						    this.secondDepartment = [res.data.data.ClinicGroup].map(item =>({text:item.CLGRPDesc,...item}));
					    }
					    this.integration()
				})
				.catch(err => {
					console.log('2：', err);
				})
			},
			integration(){
				if(!this.items.length){
					this.items = this.stairDepartment.map((i,x)=> {
						if(x===this.mainActiveIndex){
							i.children = this.secondDepartment
						}
						return i
					})
						this.filteredItems = this.items
				}else if(!this.filteredItems.length && !this.searchQuery){
					this.filteredItems = this.items
				}else {
					this.filteredItems.forEach((i,x)=> {
						if(x===this.mainActiveIndex){
							i.children = this.secondDepartment
						}
					})
				}
			},
			filterItemsFun() {
				if (this.searchQuery) {
				    this.filteredItems = this.items.map((category,index) => {
				    // 检查父类的 text 属性是否包含 searchQuery
				    const parentMatches = category.text.includes(this.searchQuery);
				    if(parentMatches){
						// this.mainActiveIndex = index
						return {
						    ...category,
						};	
				    }
				    return null;
				    }).filter(category => category !== null);
					
				} else {
				  this.filteredItems = this.items;
				}
				this.mainActiveIndex = 0
				let CliSerGroupID = this.filteredItems[this.mainActiveIndex].CliSerGroupID
				this.getSpecialtyGroup(CliSerGroupID)
			},
	        onNavClick(index) {
	            this.mainActiveIndex = index.target.index;
				let CliSerGroupID = this.filteredItems[this.mainActiveIndex].CliSerGroupID
				this.getSpecialtyGroup(CliSerGroupID)
	        },
	        onItemClick(item) {
	            this.activeId = item.target.text;
				this.searchQuery = ''
				this.filteredItems = []
				this.items = []
	            // 处理点击事件
				uni.navigateTo({
					url: `/sub_packages/subscribe/doctors?title=${item.target.text}&CLGRPRowId=${item.target.CLGRPRowId}`
				})
				// uni.navigateTo({
				// 	url: '../hpvOrder-detail/hpvOrder-detail?key=' + encodeURIComponent(JSON.stringify(item))
				// })
				
	        }
	    },
	    mounted() {
	    }
	};
</script>

<style  lang="less" scoped>
	.department {
		width: 100vw;
		height: 100%; 
		background-color: #ffffff;
		// input
		/deep/.van-search{
			width: 681.3rpx;
			height: 61.07rpx;
			background: #f2f6f9;
			border-radius: 7.63rpx;
			margin: 35rpx auto;
		}
		// select
		/deep/ .van-tree-select__nav{
			background-color: #ffffff;
		}
		/deep/ .van-sidebar-item{
			background-color: #ffffff;
		}
		/deep/ .van-sidebar-item--selected {
		  color: #3E99FF;
		  background: #f2f6f9;
		  border-color: var(--sidebar-selected-border-color,#3E99FF);
		     
		}
		/deep/ .van-tree-select__content{
			background-color: #F2F6F9;
			width: 65%;
			
			.van-ellipsis {
				border-bottom: 2rpx solid #ffffff;
			}
		}
		
	}
</style>