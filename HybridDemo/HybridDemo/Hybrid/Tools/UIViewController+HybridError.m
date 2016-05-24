//
//  UIViewController+HybridError.m
//  DV
//
//  Created by 蚩尤 on 16/3/28.
//  Copyright © 2016年 OE. All rights reserved.
//

#import <objc/runtime.h>
#import "UIViewController+HybridError.h"

static char hybirdImageViewKey;
static char hybirdButtonKey;
static char hybirdClickBlockKey;
@implementation UIViewController (HybridError)

- (void)showWithHybirdErrorClickBlock:(void(^)())click {
    UIImageView *imageView = objc_getAssociatedObject(self, &hybirdImageViewKey);
    if (!imageView) {
        imageView = [[UIImageView alloc] init];
        imageView.image = [UIImage imageNamed:@"default_avata"];
        imageView.frame = CGRectMake(0, 0, 120, 120);
        imageView.center = CGPointMake(self.view.center.x, self.view.center.y - 120);
        [self.view addSubview:imageView];
    }
    
    UIButton *errorBtn = objc_getAssociatedObject(self, &hybirdButtonKey);
    if (!errorBtn) {
        errorBtn = [[UIButton alloc] init];
        errorBtn.frame = CGRectMake(0, CGRectGetMaxY(imageView.frame), 200, 50);
        errorBtn.center = CGPointMake(self.view.center.x, CGRectGetMaxY(imageView.frame)+25);
        [errorBtn setTitle:@"载入出错，点击重试" forState:UIControlStateNormal];
        [errorBtn setTitleColor:[UIColor grayColor] forState:UIControlStateNormal];
        errorBtn.titleLabel.font = [UIFont systemFontOfSize:15];
        [errorBtn addTarget:self action:@selector(HybridErrorBtnDidClick:) forControlEvents:UIControlEventTouchUpInside];
        [self.view addSubview:errorBtn];
    }
    objc_setAssociatedObject(self, &hybirdImageViewKey, imageView, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    objc_setAssociatedObject(self, &hybirdButtonKey, errorBtn, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    objc_setAssociatedObject(self, &hybirdClickBlockKey, click, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)HybirdErrorHidden {
    UIImageView *imageView = objc_getAssociatedObject(self, &hybirdImageViewKey);
    UIButton *errorBtn= objc_getAssociatedObject(self, &hybirdButtonKey);
    objc_setAssociatedObject(self, &hybirdImageViewKey, nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    objc_setAssociatedObject(self, &hybirdButtonKey, nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    objc_setAssociatedObject(self, &hybirdClickBlockKey, nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);

    [imageView removeFromSuperview];
    [errorBtn removeFromSuperview];
}

- (void)HybridErrorBtnDidClick:(UIButton *)sender {
    void(^click)()  = objc_getAssociatedObject(self, &hybirdClickBlockKey);
    if (click) {
        click();
    }
}
@end
