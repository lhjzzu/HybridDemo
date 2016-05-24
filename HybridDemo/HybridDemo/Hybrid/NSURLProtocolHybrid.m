


//
//  NSURLProtocolHybrid.m
//  DV
//
//  Created by 蚩尤 on 16/3/11.
//  Copyright © 2016年 OE. All rights reserved.
/**
 *  处理web网络请求
 */

#import "HybridTool.h"
#import "Reachability.h"
#import <objc/runtime.h>
#import "NSString+Sha1.h"
#import "HybridConstant.h"
#import "NSURLProtocolHybrid.h"

#define WORKAROUND_MUTABLE_COPY_LEAK 0
#if WORKAROUND_MUTABLE_COPY_LEAK
// required to workaround http://openradar.appspot.com/11596316
@interface NSURLRequest(MutableCopyc)

- (id) mutableCopyWorkaround;

@end
#endif
#if WORKAROUND_MUTABLE_COPY_LEAK
@implementation NSURLRequest(MutableCopyWorkaround)

- (id) mutableCopyWorkaround {
    NSMutableURLRequest *mutableURLRequest = [[NSMutableURLRequest alloc] initWithURL:[self URL]
                                                                          cachePolicy:[self cachePolicy]
                                                                      timeoutInterval:[self timeoutInterval]];
    [mutableURLRequest setAllHTTPHeaderFields:[self allHTTPHeaderFields]];
    if ([self HTTPBodyStream]) {
        [mutableURLRequest setHTTPBodyStream:[self HTTPBodyStream]];
    } else {
        [mutableURLRequest setHTTPBody:[self HTTPBody]];
    }
    [mutableURLRequest setHTTPMethod:[self HTTPMethod]];
    
    return mutableURLRequest;
}

@end
#endif

@interface HybridCachedData : NSObject <NSCoding>
@property (nonatomic, readwrite, strong) NSData *data;
@property (nonatomic, readwrite, strong) NSURLResponse *response;
@property (nonatomic, readwrite, strong) NSURLRequest *redirectRequest;
@end
static NSString *const kDataKey = @"data";
static NSString *const kResponseKey = @"response";
static NSString *const kRedirectRequestKey = @"redirectRequest";

@implementation HybridCachedData
@synthesize data = _data;
@synthesize response = _response;
@synthesize redirectRequest = _redirectRequest;

- (void)encodeWithCoder:(NSCoder *)aCoder
{
    [aCoder encodeObject:[self data] forKey:kDataKey];
    [aCoder encodeObject:[self response] forKey:kResponseKey];
    [aCoder encodeObject:[self redirectRequest] forKey:kRedirectRequestKey];
}


- (id)initWithCoder:(NSCoder *)aDecoder
{
    self = [super init];
    if (self != nil) {
        [self setData:[aDecoder decodeObjectForKey:kDataKey]];
        [self setResponse:[aDecoder decodeObjectForKey:kResponseKey]];
        [self setRedirectRequest:[aDecoder decodeObjectForKey:kRedirectRequestKey]];
    }
    
    return self;
}

@end


@interface NSURLProtocolHybrid ()
@property (nonatomic, readwrite, strong) NSURLConnection *connection;
@property (nonatomic, readwrite, strong) NSMutableData *data;
@property (nonatomic, readwrite, strong) NSURLResponse *response;
- (void)appendData:(NSData *)newData;

@end
@implementation NSURLProtocolHybrid
@synthesize connection = _connection;
@synthesize data = _data;
@synthesize response = _response;

/**
 *  什么情况下加载本地资源?
 *  1 请求的资源路径（path）,恰好存在于ios_hybrid.properties中
 *  2 version号与ios_hybrid.properties中的版本号是相同的
 *  3 为了防止虽然路径恰好存在于ios_hybrid.properties中，但本地资源不存在，还要判断对应的本地资源路径是否为nil
 *  什么情况下加载远程资源？
 *  其他
 */

+ (NSURLRequest *)canonicalRequestForRequest:(NSURLRequest *)request
{
    return request;
}
- (NSString *)cachePathForRequest:(NSURLRequest *)aRequest
{
    // This stores in the Caches directory, which can be deleted when space is low, but we only use it for offline access
    NSString *cachesPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
    NSString *fileName = [[[aRequest URL] absoluteString] sha1];
    NSString *path = [cachesPath stringByAppendingPathComponent:fileName];
//    NSLog(@"cachesPath ==  %@",path);
//    NSLog(@"requestURL ==  %@",self.request.URL);
    
    return path;
}

+ (BOOL)canInitWithRequest:(NSURLRequest*)theRequest
{
    NSLog(@"theRequest.URL == %@",theRequest.URL);
    
    NSDictionary *properties = [HybridTool hybridProperties];
    NSString *urlPath = theRequest.URL.path;
    NSString *query = theRequest.URL.query;
    NSString *version = @"";
    NSMutableDictionary *paramDic = [HybridTool paramDicWithQuery:query];
    version = [paramDic objectForKey:@"version"];
    
    if (![HybridTool isStringEmpty:urlPath]) {
        for (NSString *key in properties.allKeys) {
            if ([key hasSuffix:urlPath]) {
                //版本号相同，加载本地的资源，版本号不同，那么在服务端下载
                //判断截取到的服务端的版本号version 是否与本地指定的版本号相统一
                BOOL isEqual = [version isEqualToString:properties[key]];
                NSString *filePath = nil;
                filePath = [NSString stringWithFormat:@"Resource.bundle/%@",key];
                filePath = [[NSBundle mainBundle] pathForResource:filePath ofType:nil];
                //请求的资源在本地是否存在
                BOOL fileExist = ![HybridTool isStringEmpty:filePath];
                if (isEqual && fileExist) {
                    return YES;//加载本地资源
                } 
            }
        }
    }
    if ([theRequest valueForHTTPHeaderField:HybridCachingURLHeader] == nil ) {//离线缓存界面
        return YES;// （版本号不一致并且本地资源不存在）

    } else {
        return NO;//当为NO时，不往下走。由系统来处理
    }
}
- (void)startLoading
{
    NSDictionary *properties = [HybridTool hybridProperties];
    NSURLResponse *response;
    NSString *filePath = nil;
    BOOL isContain = NO;
    for (NSString *key in properties.allKeys) {
        if (![HybridTool isStringEmpty:self.request.URL.path]) {
            if ([key hasSuffix:self.request.URL.path] && ![HybridTool isStringEmpty:self.request.URL.path]) {
                NSMutableDictionary *paramDic = [HybridTool paramDicWithQuery:self.request.URL.query];
                NSString *version = [paramDic objectForKey:@"version"];
                if ([version isEqualToString:properties[key]]) {//版本号一致
                    response = [[NSURLResponse alloc] initWithURL:self.request.URL
                                                         MIMEType:@""//最好不填
                                            expectedContentLength:-1
                                                 textEncodingName:nil];
                    filePath = [NSString stringWithFormat:@"Resource.bundle/%@",key];
                    filePath = [[NSBundle mainBundle] pathForResource:filePath ofType:nil];
                    NSData *data = [NSData dataWithContentsOfFile:filePath];
                    [[self client] URLProtocol:self didReceiveResponse:response
                            cacheStoragePolicy:NSURLCacheStorageNotAllowed];
                    [[self client] URLProtocol:self didLoadData:data];
                    [[self client] URLProtocolDidFinishLoading:self];
                    NSError *error;
                    [[self client] URLProtocol:self didFailWithError:error];
                    isContain = YES;
                }
            }
        }
    }
    if (!isContain) {
        if (![self useCache]) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
            NSMutableURLRequest *connectionRequest =
#if WORKAROUND_MUTABLE_COPY_LEAK
            [[self request] mutableCopyWorkaround];
#else
            [[self request] mutableCopy];
#endif
            [connectionRequest setValue:@"" forHTTPHeaderField:HybridCachingURLHeader];
            NSURLConnection *connention = [NSURLConnection connectionWithRequest:connectionRequest delegate:self];
#pragma clang diagnostic pop
            [self setConnection:connention];
        } else {
            NSString *cachePath = [HybridTool cachePathForRequest:[self request]];
            HybridCachedData *cache = [NSKeyedUnarchiver unarchiveObjectWithFile:cachePath];
            if (cache) {
                NSData *data = [cache data];
                NSURLResponse *response = [cache response];
                NSURLRequest *redirectRequest = [cache redirectRequest];
                if (redirectRequest) {
                    [[self client] URLProtocol:self wasRedirectedToRequest:redirectRequest redirectResponse:response];
                } else {
                    
                    [[self client] URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed]; // we handle caching ourselves.
                    [[self client] URLProtocol:self didLoadData:data];
                    [[self client] URLProtocolDidFinishLoading:self];
                }
            }
            else {
                [[self client] URLProtocol:self didFailWithError:[NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorCannotConnectToHost userInfo:nil]];
            }
        }
    }
}

- (void)stopLoading
{
    [[self connection] cancel];
}

- (NSURLRequest *)connection:(NSURLConnection *)connection willSendRequest:(NSURLRequest *)request redirectResponse:(NSURLResponse *)response {
    if (response != nil) {
        NSMutableURLRequest *redirectableRequest =
#if WORKAROUND_MUTABLE_COPY_LEAK
        [request mutableCopyWorkaround];
#else
        [request mutableCopy];
#endif
        [redirectableRequest setValue:nil forHTTPHeaderField:HybridCachingURLHeader];
        
        NSString *cachePath = [HybridTool cachePathForRequest:[self request]];
        HybridCachedData *cache = [HybridCachedData new];
        [cache setResponse:response];
        [cache setData:[self data]];
        [cache setRedirectRequest:redirectableRequest];
        [NSKeyedArchiver archiveRootObject:cache toFile:cachePath];
        [[self client] URLProtocol:self wasRedirectedToRequest:redirectableRequest redirectResponse:response];
        return redirectableRequest;
    } else {
        
        return request;
    }
}
- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [[self client] URLProtocol:self didLoadData:data];
    [self appendData:data];
    
}
- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    [[self client] URLProtocol:self didFailWithError:error];
    [self setConnection:nil];
    [self setData:nil];
    [self setResponse:nil];
}
- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    [self setResponse:response];
    [[self client] URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed]; //We cache ourselves.
    
}
- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    [[self client] URLProtocolDidFinishLoading:self];
    NSString *cachePath = [HybridTool cachePathForRequest:[self request]];
    HybridCachedData *cache = [HybridCachedData new];
    [cache setResponse:[self response]];
    [cache setData:[self data]];
    [NSKeyedArchiver archiveRootObject:cache toFile:cachePath];
    
    [self setConnection:nil];
    [self setData:nil];
    [self setResponse:nil];
}

- (BOOL)useCache
{
    BOOL reachable = (BOOL) [[Reachability reachabilityWithHostName:[[[self request] URL] host]] currentReachabilityStatus] != NotReachable;
    return !reachable;
}

- (void)appendData:(NSData *)newData
{
    if ([self data] == nil) {
        [self setData:[newData mutableCopy]];
    }
    else {
        [[self data] appendData:newData];
    }
}
@end
