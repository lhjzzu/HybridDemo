//
//  ViewController.m
//  HybridDemo
//
//  Created by 蚩尤 on 16/5/23.
//  Copyright © 2016年 ouer. All rights reserved.
//
#import "HybridTool.h"
#import "AFNetworking.h"
#import <objc/runtime.h>
#import "ViewController.h"
#import "DVCommodityListVC.h"
#import "NSURLProtocolHybrid.h"
#import "DVCommodityDetailVC.h"
#import "DVWebviewController.h"
#import "WebViewJavascriptBridge.h"
#import "UIViewController+HybridError.h"
#define WS(wSelf)    __weak typeof(self) wSelf = self;
static char *handlerNameKey;
static char *handlerDataKey;

@interface ViewController ()
<UIWebViewDelegate>

{
    UIWebView *webView;
}
@property (nonatomic,strong) WebViewJavascriptBridge *bridge;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    //1 注册协议
    [NSURLProtocol registerClass:[NSURLProtocolHybrid class]];
    
    //2 创建webview
    webView = [[UIWebView alloc] init];
    webView.frame = self.view.frame;
    [self.view addSubview:webView];
    //3 根据webview创建并定义bridge
    [self defineWebViewBridge];
    //4 载入h5
    NSURLRequest *request  = [[NSURLRequest alloc] initWithURL:[NSURL URLWithString:@"http://m.kkkd.com/cms/home?appKey=962b586e1e3412ca43e88699c96cb3re"]];
    [webView loadRequest:request];
    
}

- (void)defineWebViewBridge {
    WS(wSelf);
#ifdef DEBUG
        [WebViewJavascriptBridge enableLogging];
#endif
        _bridge = [WebViewJavascriptBridge bridgeForWebView:webView webViewDelegate:self handler:^(id data, WVJBResponseCallback responseCallback) {
            NSLog(@"ObjC received message from JS: %@", data);
            responseCallback(data);
        }];
        
        //注册API调用事件
        [_bridge registerHandler:@"BridgeNativeCallOuerApiHandler" handler:^(id data, WVJBResponseCallback responseCallback) {
            if (!wSelf) {
                return ;
            }
            NSLog(@"BridgeNativeCallOuerApiHandler called: %@", data);
            [wSelf doWithData:data responseCallback:responseCallback];
        }];
        //注册关闭屏幕事件
        [_bridge registerHandler:@"BridgeNativeCloseScreenHandler" handler:^(id data, WVJBResponseCallback responseCallback) {
            if (!wSelf) {
                return ;
            }
            if (wSelf.presentingViewController) {
                [wSelf dismissViewControllerAnimated:YES completion:NULL];
            } else {
                [wSelf.navigationController popViewControllerAnimated:YES];
            }
            NSLog(@"BridgeNativeCloseScreenHander called: %@", data);
            responseCallback(data);
        }];
        // 注册设置标题事件
        [_bridge registerHandler:@"BridgeNativeSetTitleHandler" handler:^(id data, WVJBResponseCallback responseCallback) {
            if (!wSelf) {
                return ;
            }
            wSelf.navigationItem.title = data;
            NSLog(@"BridgeNativeSetTitleHandler called: %@", data);
            responseCallback(data);
        }];
        // 注册设置文本菜单栏(添加导航栏右边的按钮)
        [_bridge registerHandler:@"BridgeNativeAddMenuTxtHandler" handler:^(id data, WVJBResponseCallback responseCallback) {
            if (!wSelf) {
                return ;
            }
            NSString *title = data[@"title"];
            NSLog(@"BridgeNativeAddMenuTxtHandler called: %@", data);
            UIBarButtonItem *barItem = [[UIBarButtonItem alloc] initWithTitle:title style:UIBarButtonItemStylePlain target:wSelf action:@selector(barItemClick:)];
            objc_setAssociatedObject(barItem, &handlerNameKey, data[@"handler"], OBJC_ASSOCIATION_RETAIN_NONATOMIC);
            objc_setAssociatedObject(barItem, &handlerDataKey, data[@"handlerData"], OBJC_ASSOCIATION_RETAIN_NONATOMIC);
            if (wSelf.navigationItem.rightBarButtonItems.count == 0) {
                wSelf.navigationItem.rightBarButtonItems = @[barItem];
            } else {
                NSMutableArray *items = [NSMutableArray arrayWithArray:wSelf.navigationItem.rightBarButtonItems];
                [items insertObject:barItem atIndex:0];
                
                wSelf.navigationItem.rightBarButtonItems = items;
            }
            responseCallback(data);
            
        }];
}

- (void)barItemClick:(UIBarButtonItem *)item {
    NSString *handlerName = objc_getAssociatedObject(item, &handlerNameKey);
    id  handlerData  = objc_getAssociatedObject(item, &handlerDataKey);
    [_bridge callHandler:handlerName data:handlerData responseCallback:^(id responseData) {
        NSLog(@"%@",responseData);
    }];
}
- (void)doWithData:(id)data responseCallback:(WVJBResponseCallback)responseCallback{
    NSString *paramStr = data[@"data"];
    NSDictionary *paramDic = [HybridTool paramDicWithQuery:paramStr];
    NSString *url = data[@"url"];
    NSString *method = data[@"method"];
    NSMutableDictionary *reqDic = [NSMutableDictionary dictionaryWithDictionary:paramDic];
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    WS(wSelf);
    if ([method isEqualToString:@"GET"]) {
        [manager GET:url parameters:reqDic progress:NULL success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
            if (!wSelf) {
                return ;
            }
            [wSelf jsonStrWithResponseObject:responseObject responseCallback:responseCallback];
        } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
            if (!wSelf) {
                return ;
            }
            [wSelf doWithError:error responseCallback:responseCallback];

        }];
    } else {
        [manager POST:url parameters:paramDic progress:NULL success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
            if (!wSelf) {
                return ;
            }
            [wSelf jsonStrWithResponseObject:responseObject responseCallback:responseCallback];
        } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
            [wSelf doWithError:error responseCallback:responseCallback];
        }];
    }
    
    
}

- (void)doWithError:(NSError *)error responseCallback:(WVJBResponseCallback)responseCallback{
    NSMutableDictionary *responseObject = [NSMutableDictionary dictionary];
    [responseObject setValue:@"" forKey:@"data"];
    [responseObject setValue:@"" forKey:@"details"];
    if (error.code == -1009) {
        [responseObject setValue:@(-99) forKey:@"status"];
        [responseObject setValue:@"网络不可用" forKey:@"msg"];
        
    } else  if (error.code == -1005 || error.code == -1001) {
        [responseObject setValue:@(-98) forKey:@"status"];
        [responseObject setValue:@"网络异常" forKey:@"msg"];
    }
    else {
        [responseObject setValue:@(-100) forKey:@"status"];
        [responseObject setValue:@"未知错误" forKey:@"msg"];
    }
    [self jsonStrWithResponseObject:responseObject responseCallback:responseCallback];
}

- (void)jsonStrWithResponseObject:(id)responseObject responseCallback:(WVJBResponseCallback)responseCallback{
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:responseObject options:NSJSONWritingPrettyPrinted error:NULL];
    NSString *jsonStr = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    responseCallback(jsonStr);
}


#pragma mark -- UIWebViewDelegate
- (BOOL)webView:(UIWebView *)webV shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    
    NSLog(@"request.URL ====    %@",request.URL);
    NSLog(@"navigationType ====    %@",@(navigationType));
    
    if (navigationType == UIWebViewNavigationTypeLinkClicked) {
        
        NSString *urlString = request.URL.absoluteString;
        //假如链接中有汉字编码，需将链接中的汉字编码转换为汉字
        NSString *query = [request.URL.query  stringByRemovingPercentEncoding];
        NSMutableDictionary *paramDic = [HybridTool paramDicWithQuery:query];
        if ([paramDic.allKeys containsObject:@"vc"]) {
            NSString *vcString = paramDic[@"vc"];
            //假如有商品详情界面，且类名为DVCommodityDetailVC
            if ([vcString isEqualToString:@"DVCommodityDetailVC"]) {
                DVCommodityDetailVC *detailVC = [[DVCommodityDetailVC alloc] init];
//                detailVC.productId = paramDic[@"id"];
//                detailVC.hidesBottomBarWhenPushed = YES;
                [self.navigationController pushViewController:detailVC animated:YES];
            }
            //假如有商品列表界面，且类名为DVCommodityDetailVC
            if ([vcString isEqualToString:@"DVCommodityListVC"]) {
                DVCommodityListVC *listVC = [[DVCommodityListVC alloc] init];
//                listVC.category = [paramDic objectForKey:@"category"];
//                listVC.kwd = [paramDic objectForKey:@"kwd"];
//                listVC.tag = [paramDic objectForKey:@"tag"];
//                listVC.size = [paramDic objectForKey:@"size"];
//                listVC.title = [paramDic objectForKey:@"title"];
//                listVC.attribute = [paramDic objectForKey:@"attribute"];
//                listVC.freePost = [[paramDic objectForKey:@"freePost"] boolValue];
//                listVC.recommend = [[paramDic objectForKey:@"recommend"] boolValue];
//                listVC.hidesBottomBarWhenPushed = YES;
                [self.navigationController pushViewController:listVC animated:YES];
            }
        } else {
            
            NSDictionary *hyErrorDic = [HybridTool HybridErrorProperties];
            NSString *hyErrorStr = [hyErrorDic objectForKey:@"error"];
            if ([request.URL.path hasSuffix:hyErrorStr]) {
                return NO;
            }
            if ([[paramDic objectForKey:@"tab"] boolValue]) {

                return YES;
            }
            //假如跳转后的界面也是一个h5
            DVWebviewController *webViewController = [[DVWebviewController alloc] init];
//            webViewController.url = urlString;
//            webViewController.hidesBottomBarWhenPushed = YES;
            [self.navigationController pushViewController:webViewController animated:YES];
        }
        return NO;
    } else if (navigationType == UIWebViewNavigationTypeOther) {
        NSDictionary *hyErrorDic = [HybridTool HybridErrorProperties];
        NSString *hyErrorStr = [hyErrorDic objectForKey:@"error"];
        if ([request.URL.path hasSuffix:hyErrorStr]) {
            //加载出错的错误处理
            // do something with code 
            
            return NO;
        }
        
    }
    return YES;
}
- (void)webViewDidStartLoad:(UIWebView *)webV
{
   
}
- (void)webViewDidFinishLoad:(UIWebView *)webV
{
    
}
- (void)webView:(UIWebView *)webV didFailLoadWithError:(NSError *)error
{
    

}



@end
