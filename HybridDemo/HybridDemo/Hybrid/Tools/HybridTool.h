//
//  HybridTool.h
//  Hybrid
//
//  Created by 蚩尤 on 16/2/23.
//  Copyright © 2016年 ouer. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@interface HybridTool : NSObject
+ (BOOL)isStringEmpty:(NSString *)str;
/**
 *  获取定义的属性字典
 */
+ (NSDictionary *)hybridProperties;

/**
 *  获取定义的错误处理属性字典
 */
+ (NSDictionary *)HybridErrorProperties;
/**
 *  获取参数字典
 */
+ (NSMutableDictionary *)paramDicWithQuery:(NSString *)query;
/**
 *  获取离线文件缓存大小
 */
+ (NSUInteger)getSize;
/**
 *  缓存路径夹
 */
+ (NSString *)cachesPath;
/**
 *  对某个请求文件的缓存路径
 */
+ (NSString *)cachePathForRequest:(NSURLRequest *)aRequest;
/**
 *  清除缓存
 */
+ (void)clearCache;
@end
