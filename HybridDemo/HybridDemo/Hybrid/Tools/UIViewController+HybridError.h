//
//  UIViewController+HybridError.h
//  DV
//
//  Created by 蚩尤 on 16/3/28.
//  Copyright © 2016年 OE. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIViewController (HybridError)

- (void)showWithHybirdErrorClickBlock:(void(^)())click;
- (void)HybirdErrorHidden;
@end
