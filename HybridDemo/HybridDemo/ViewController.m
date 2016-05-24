//
//  ViewController.m
//  HybridDemo
//
//  Created by 蚩尤 on 16/5/23.
//  Copyright © 2016年 ouer. All rights reserved.
//

#import "ViewController.h"
#import "NSURLProtocolHybrid.h"
#define Home_URL  [NSString stringWithFormat:@"http://%@/%@?%@=%@",@"m.kkkd.com",@"cms/home",@"appKey",@"962b586e1e3412ca43e88699c96cb3re"]
@interface ViewController ()
{
    UIWebView *webView;
}
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    //注册
    [NSURLProtocol registerClass:[NSURLProtocolHybrid class]];
    
   
    webView = [[UIWebView alloc] init];
    webView.frame = self.view.frame;
    [self.view addSubview:webView];
    
    NSURLRequest *request  = [[NSURLRequest alloc] initWithURL:[NSURL URLWithString:Home_URL]];
    [webView loadRequest:request];
    
    
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
